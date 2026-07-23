import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      brand: {
        name: 'ILTCT',
        subtitle: 'by Método Cabello de Luna',
      },
      nav: {
        home: 'Inicio',
        theory: 'Teoría',
        practice: 'Práctica',
        profile: 'Perfil',
      },
      auth: {
        loginTitle: 'Iniciar Sesión',
        restrictedAccess: 'Acceso exclusivo para alumnos con franquicia activa.',
        franchiseCode: 'Código de Inscripción / Franquicia',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        loginButton: 'Ingresar',
        noCodeRegister: '¿Tenés un código de franquicia? Registrarte',
        forgotPassword: '¿Olvidaste tu contraseña?',
        registerTitle: 'Registro de Alumno',
        registerSubtitle: 'Sin un código de franquicia emitido por el instituto no podrás registrarte.',
        paymentTitle: 'Inscripción y Colegiatura',
        paymentSubtitle: 'Acceso completo al programa de 17 meses.',
        payButton: 'Proceder al Pago Seguro',
        verifyTitle: 'Verificar Cuenta',
        verifySubtitle: 'Ingresá el código de 6 dígitos enviado a tu correo.',
      },
      home: {
        welcome: 'Hola',
        globalProgress: 'Progreso del Programa',
        monthProgress: 'Mes {{month}} de 17',
        theoryLabel: 'Teoría',
        practiceLabel: 'Práctica',
        currentWeek: 'Módulo de la Semana',
        featuredTeacher: 'Docente Destacado (IA)',
        support: 'Soporte',
        glossary: 'Glosario',
      },
    },
  },
  en: {
    translation: {
      brand: {
        name: 'ILTCT',
        subtitle: 'by Método Cabello de Luna',
      },
      nav: {
        home: 'Home',
        theory: 'Theory',
        practice: 'Practice',
        profile: 'Profile',
      },
      auth: {
        loginTitle: 'Log In',
        restrictedAccess: 'Exclusive access for students with active franchise.',
        franchiseCode: 'Enrollment / Franchise Code',
        email: 'Email',
        password: 'Password',
        loginButton: 'Log In',
        noCodeRegister: 'Do you have a franchise code? Register',
        forgotPassword: 'Forgot your password?',
        registerTitle: 'Student Registration',
        registerSubtitle: 'Without a valid franchise code issued by the institute you cannot register.',
        paymentTitle: 'Enrollment and Tuition',
        paymentSubtitle: 'Full access to the 17-month program.',
        payButton: 'Proceed to Secure Payment',
        verifyTitle: 'Verify Account',
        verifySubtitle: 'Enter the 6-digit code sent to your email.',
      },
      home: {
        welcome: 'Hello',
        globalProgress: 'Program Progress',
        monthProgress: 'Month {{month}} of 17',
        theoryLabel: 'Theory',
        practiceLabel: 'Practice',
        currentWeek: 'Module of the Week',
        featuredTeacher: 'Featured Teacher (AI)',
        support: 'Support',
        glossary: 'Glossary',
      },
    },
  },
  pt: {
    translation: {
      brand: {
        name: 'ILTCT',
        subtitle: 'by Método Cabello de Luna',
      },
      nav: {
        home: 'Início',
        theory: 'Teoria',
        practice: 'Prática',
        profile: 'Perfil',
      },
      auth: {
        loginTitle: 'Entrar',
        restrictedAccess: 'Acesso exclusivo para alunos com franquia ativa.',
        franchiseCode: 'Código de Inscrição / Franquia',
        email: 'E-mail',
        password: 'Senha',
        loginButton: 'Entrar',
        noCodeRegister: 'Tem um código de franquia? Cadastre-se',
        forgotPassword: 'Esqueceu sua senha?',
        registerTitle: 'Cadastro de Aluno',
        registerSubtitle: 'Sem um código de franquia válido emitido pelo instituto você não pode se cadastrar.',
        paymentTitle: 'Inscrição e Mensalidade',
        paymentSubtitle: 'Acesso completo ao programa de 17 meses.',
        payButton: 'Ir para Pagamento Seguro',
        verifyTitle: 'Verificar Conta',
        verifySubtitle: 'Insira o código de 6 dígitos enviado para o seu e-mail.',
      },
      home: {
        welcome: 'Olá',
        globalProgress: 'Progresso do Programa',
        monthProgress: 'Mês {{month}} de 17',
        theoryLabel: 'Teoria',
        practiceLabel: 'Prática',
        currentWeek: 'Módulo da Semana',
        featuredTeacher: 'Professor Destaque (IA)',
        support: 'Suporte',
        glossary: 'Glossário',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
