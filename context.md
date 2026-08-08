# Contexto de Desarrollo y Producción - App Cabello de Luna / ILTCT

Este documento recopila la configuración relevante, variables de entorno, mecanismos de prueba en desarrollo y los pasos necesarios para desplegar a producción.

---

## 🔀 Git: dual remote (personal + Whapy)

Un solo working copy local. **No** cambiar `origin` al repo de Whapy: así deploys, EAS, Vercel y `.env` siguen apuntando al repo personal.

| Remote | URL | Rol |
|---|---|---|
| `origin` | `https://github.com/GabrieLZ19/App-Cabello-de-Luna.git` | Trabajo diario + deploys |
| `whapy` | `https://github.com/Whapy-Dev/Cabello-de-luna.git` | Entrega / espejo empresa |

### Día a día (después de cada commit)

```bash
git push origin main && git push whapy main
```

`git push` / `git pull` sin argumentos siguen yendo a **origin** (upstream = `origin/main`).

### Qué no hacer

- No clonar el repo vacío de Whapy para “rellenarlo” a mano.
- No cambiar `origin` a Whapy (rompe deploys / hábitos de CI).
- No reconectar Vercel/EAS al repo de Whapy salvo pedido explícito.
- No force-push a Whapy si ya hay trabajo de otra persona.

Playbook reutilizable (otros proyectos): `t2t-app/docs/WHAPY_DUAL_REMOTE.md`.

---

## 🔑 Autenticación y Verificación OTP

### Modo Desarrollo (`NODE_ENV !== 'production'`)
- **Código Maestro de Prueba**: El código de verificación universal **`123456`** está habilitado para pruebas rápidas en la pantalla de verificación (`verify.tsx`).
- **Impresión de OTP en Consola**: Cada vez que se registra un usuario o se reenvía un código, el backend genera un código aleatorio de 6 dígitos y lo imprime en los logs de la terminal (`LOG [MailService] [CÓDIGO VERIFICACIÓN OTP] Destinatario: ... | Código: XXXXXX`).
- **Inclusión en JSON**: En modo desarrollo, la respuesta de la API REST también incluye la propiedad `otpCode` en el cuerpo del JSON para pruebas automáticas.

### Modo Producción (`NODE_ENV === 'production'`)
- El código universal `123456` se **desactiva automáticamente**.
- La propiedad `otpCode` se omite de los JSON devueltos por el backend.
- Los códigos expirarán estrictamente a los 15 minutos de su generación.

---

## 🔒 Encriptación de Contraseñas y Seguridad

- **Bcrypt (10 Rondas de Salado)**: Las contraseñas de las alumnas y usuarios se encriptan con `bcrypt` en el servidor NestJS antes de registrar la fila en Supabase. Nunca se almacenan contraseñas en texto plano.
- **JWT (JSON Web Token)**: Tras la verificación, el cliente recibe un `accessToken` JWT que se guarda de manera segura en la aplicación móvil usando `expo-secure-store`.

---

## ✉️ Configuración para Producción (Correo Transaccional)

Para habilitar el envío real de correos electrónicos a las casillas de las alumnas en producción, agregar las siguientes variables en `apps/backend/.env`:

```env
NODE_ENV=production
JWT_SECRET=tu_clave_secreta_super_segura

# Configuración SMTP (Ejemplo con Gmail, Resend SMTP o Brevo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@tu-instituto.com
SMTP_PASS=tu_contraseña_de_aplicacion
```

### Checklist emails en producción
1. `NODE_ENV=production` (desactiva OTP maestro `123456` y omite `otpCode` en JSON).
2. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` configurados y verificados.
3. Probar flujo de **verificación de cuenta** (registro / reenvío OTP).
4. Probar flujo de **recuperación de contraseña** (asunto y plantilla distintos).
5. Confirmar que el remitente no cae en spam (SPF/DKIM del proveedor SMTP).

---

### Push notifications (Expo)
- La app registra el token en `POST /notifications/register-token`.
- Triggers: módulo liberado (scheduler) y feedback de práctica (approve/corrección).
- En dispositivo real/dev client hace falta `expo-notifications` instalado (`pnpm install` en el monorepo).
- Push: el ícono es el de la app (nativo). El toast del CRM usa `/logo.png` estático — no hace falta `PUSH_LOGO_URL`.
- Tiempo real (WebSocket): namespace `/realtime` — CRM recibe `practice:submitted`, alumna recibe `practice:reviewed`. Toast CRM arriba a la derecha con animación.

### Liberación automática de módulos
- Job Nest (`ModuleReleaseScheduler`): al arrancar + cada **1 hora**.
- Publica módulos `DRAFT` con `releaseDate <= now` → `PUBLISHED` + push/realtime.
- Para “cada sábado”: en el CRM poner `releaseDate` el sábado correspondiente (no hace falta cron semanal aparte).
- Gamificación/desbloqueo por alumna: `ProgressService` (aprobar evaluación ≥7/10).

### Storage de evidencias (Supabase)
- Bucket `practice-evidences`: **privado**, máx. 30 MB, MIME de imagen/video acotados.
- En DB se guarda el **path** del objeto (no URL pública).
- Al leer prácticas, el backend firma URLs temporales (~2 h) con `SUPABASE_SECRET_KEY` (API Keys nuevas). Fallback legacy: `SUPABASE_SERVICE_ROLE_KEY`.
- Al reenviar evidencia se borran los archivos anteriores (sin huérfanos).
- Cleanup semanal (`EvidenceCleanupScheduler`): compara Storage vs tabla `evidences` y borra huérfanos.
- Variable requerida en `apps/backend/.env`: `SUPABASE_SECRET_KEY` (Dashboard → API Keys → Secret keys).

---

## 🗄️ Base de Datos y Supabase
- **URL PostgreSQL**: Conectado a la instancia de Supabase PostgreSQL a través del pooler IPv4.
- **Franquicias de Prueba**: `ILTCT-MEX` (Franquicia activa configurada en la tabla `franchises`).

---

## 📱 Móvil (Expo React Native)
- **Safe Area Insets**: Las pestañas inferiores están envueltas dinámicamente con `useSafeAreaInsets()` para evitar solapamientos con la barra de navegación nativa de Android.
- **Ocultado de Contraseñas**: Los TextInput de contraseñas incluyen `secureTextEntry={!showPassword}`, `autoCapitalize="none"`, `autoCorrect={false}` y `spellCheck={false}` para evitar vistas previas del teclado táctil.
