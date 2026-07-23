import { PrismaClient, Role, Language, EnrollmentStatus, Phase, CutStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando sembrado de datos pedagógicos completos desde Clase 1.md (seed)...');

  // 1. Franquicias por defecto
  const mex = await prisma.franchise.upsert({
    where: { code: 'ILTCT-MEX' },
    update: {},
    create: {
      code: 'ILTCT-MEX',
      name: 'ILTCT Ciudad de México',
      location: 'CDMX, México',
      isActive: true,
    },
  });

  const arg = await prisma.franchise.upsert({
    where: { code: 'ILTCT-ARG' },
    update: {},
    create: {
      code: 'ILTCT-ARG',
      name: 'ILTCT Buenos Aires',
      location: 'Buenos Aires, Argentina',
      isActive: true,
    },
  });

  // 2. Usuarios por defecto
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const assistantPassword = await bcrypt.hash('Assistant123!', 10);
  const studentPassword = await bcrypt.hash('Student123!', 10);

  await prisma.user.upsert({
    where: { email: 'mariana@instituto.com' },
    update: {},
    create: {
      email: 'mariana@instituto.com',
      passwordHash: adminPassword,
      fullName: 'Mariana Gualda',
      phone: '+52 55 1234 5678',
      role: Role.ADMIN,
      language: Language.ES,
      enrollmentStatus: EnrollmentStatus.ACTIVE,
      currentPhase: Phase.GRADUATED,
    },
  });

  await prisma.user.upsert({
    where: { email: 'dani@instituto.com' },
    update: {},
    create: {
      email: 'dani@instituto.com',
      passwordHash: assistantPassword,
      fullName: 'Dani Asistente',
      phone: '+52 55 8765 4321',
      role: Role.ASSISTANT,
      language: Language.ES,
      enrollmentStatus: EnrollmentStatus.ACTIVE,
      currentPhase: Phase.GRADUATED,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'sofia@instituto.com' },
    update: {},
    create: {
      email: 'sofia@instituto.com',
      passwordHash: studentPassword,
      fullName: 'Ana Sofía López',
      phone: '+52 55 9999 8888',
      role: Role.STUDENT,
      language: Language.ES,
      enrollmentStatus: EnrollmentStatus.ACTIVE,
      currentPhase: Phase.THEORY,
      franchiseId: mex.id,
    },
  });

  // 3. Avatar Docente IA de Tricología y Dermatología
  const marianaAvatar = await prisma.avatar.upsert({
    where: { id: 'avatar-mariana-ia' },
    update: {},
    create: {
      id: 'avatar-mariana-ia',
      name: 'Especialista en Tricología Cosmética y Tricotilosis',
      specialty: 'Avatar IA · Método Cabello de Luna®',
      systemPrompt: 'Sos la mentora experta en tricología cosmética e instructora del ILTCT.',
      isMarianaClone: true,
    },
  });

  // 4. Módulo 1 / Clase 1 con contenido pedagógico completo extraído de Clase 1.md
  const module1 = await prisma.theoreticalModule.upsert({
    where: { id: 'mod-1' },
    update: {
      title: 'Introducción al Método Cabello de Luna®',
      description: 'Fundamentos del método, filosofía "Menos es más", análisis del daño mecánico y prevención de tricoptilosis.',
      level: 'Técnico Profesional',
      instructorName: 'Especialista en Tricología Cosmética y Tricotilosis – Método Cabello de Luna®',
      totalDurationMinutes: 20,
      objectivesJson: [
        'Definir qué es el Método Cabello de Luna®.',
        'Comprender la filosofía de preservación capilar.',
        'Reconocer el papel del Técnico Especialista en Tricología Cosmética y Tricotilosis.',
        'Comprender la importancia de la observación integral del cabello.',
        'Identificar los principales factores que deterioran la fibra capilar.',
        'Entender el enfoque multidisciplinario del método.',
      ],
      competenciesJson: [
        'Observar el cabello desde una perspectiva integral.',
        'Identificar factores mecánicos que afectan la salud capilar.',
        'Reconocer señales que requieren derivación profesional.',
        'Comprender la relación entre cuero cabelludo, folículo piloso y fibra capilar.',
        'Aplicar los principios fundamentales del Método Cabello de Luna®.',
      ],
      contentMarkdown: `
# INTRODUCCIÓN AL MÉTODO CABELLO DE LUNA®

Bienvenido al Instituto Latinoamericano de Tricología Cosmética y Tricotilosis. Has iniciado una formación diseñada para comprender el cabello desde una perspectiva diferente a la utilizada tradicionalmente por la industria estética.

Durante muchos años, la atención se ha centrado en modificar la apariencia del cabello mediante procedimientos químicos, herramientas térmicas y técnicas de transformación estética. Sin embargo, pocas veces se analiza una pregunta fundamental:

### ¿Está realmente sano el cabello?

El Método Cabello de Luna® surge para responder esta pregunta. Su objetivo principal es regresar el cabello a su estado natural después de haber sido procesado, maltratado y en algunos casos destruido. Su objetivo es **preservar su salud**.

Porque un cabello saludable conserva naturalmente:
- **Brillo natural**
- **Elasticidad**
- **Movimiento**
- **Resistencia**
- **Suavidad**

Cuando la fibra capilar pierde estas características, comienza un proceso de deterioro progresivo que puede manifestarse como frizz, quiebre, puntas abiertas o pérdida de longitud visible.

Por esta razón, la filosofía del Método Cabello de Luna® se basa en **sanar, prevenir y preservar la salud capilar**.

---

## ¿QUÉ ES EL MÉTODO CABELLO DE LUNA®?

El Método Cabello de Luna® es un sistema integral de restauración capilar que busca conservar la integridad de la fibra mediante la observación, la educación y la corrección de hábitos que generan daño.

A diferencia de otros enfoques, el método entiende que el cabello además de dañarse por un proceso químico, la mayor parte del daño ocurre diariamente a través de acciones aparentemente simples como:

- Dormir con el cabello mojado.
- Cepillar incorrectamente.
- Utilizar calor excesivo.
- Recoger el cabello húmedo.
- Utilizar extensiones o mantener peinados tirantes.
- Someter constantemente la fibra a fricción.
- Tratamientos alisantes y decoloraciones.

Estas agresiones pueden parecer insignificantes cuando ocurren una sola vez. Sin embargo, cuando se repiten durante meses o años terminan generando un deterioro acumulativo.

---

## LA FILOSOFÍA DEL MÉTODO: MENOS ES MÁS

El principio central del Método Cabello de Luna® puede resumirse en una frase:

# MENOS ES MÁS

- **Mientras menos agresiones reciba la fibra**: Mayor será su capacidad de conservación.
- **Mientras menos calor reciba**: Mayor será su resistencia.
- **Mientras menos químicos reciba**: Mayor será su integridad estructural.
- **Mientras menos tracción soporte**: Mayor será su capacidad de crecimiento visible.

La restauración comienza cuando detenemos el daño.

---

## EL CABELLO ADEMÁS DE CRECER MÁS, NECESITA ROMPERSE MENOS

Uno de los conceptos más importantes del Método Cabello de Luna® es que muchas personas creen que su cabello no crece. Sin embargo, en la mayoría de los casos sí está creciendo: **lo que ocurre es que se rompe al mismo ritmo al que crece**.

Por ejemplo: Si un cabello crece un centímetro al mes, pero se rompe un centímetro al mes, la persona percibirá que nunca aumenta de longitud. Por ello, la preservación de la fibra es tan importante como el crecimiento del cabello. La misión del técnico especialista consiste en ayudar a conservar aquello que el organismo ya está produciendo.

---

## EL CABELLO COMO SISTEMA INTEGRAL

El Método Cabello de Luna® considera que el cabello forma parte de un sistema biológico compuesto por:
- Cuero cabelludo
- Folículo piloso
- Fibra capilar
- Hábitos cotidianos
- Factores ambientales
- Productos cosméticos

Observar únicamente la fibra visible es un error frecuente. El técnico especialista debe aprender a observar el sistema completo.

---

## EL ENFOQUE MULTIDISCIPLINARIO

Aunque el Técnico Especialista no realiza diagnósticos médicos, sí debe comprender factores básicos que pueden influir sobre la salud capilar. Por ello el método incorpora nociones generales de:

- **Dermatología**: Para reconocer alteraciones visibles del cuero cabelludo.
- **Nutrición**: Para comprender cómo la alimentación influye sobre la calidad del cabello.
- **Endocrinología**: Para reconocer posibles señales relacionadas con alteraciones hormonales.
- **Química Cosmética**: Para comprender cómo interactúan los productos cosméticos con la fibra capilar.

Este conocimiento permite realizar observaciones más completas y derivar oportunamente cuando sea necesario.

---

## LA MISIÓN DEL TÉCNICO ESPECIALISTA

El Técnico Especialista tiene una función muy clara. No consiste únicamente en observar el cabello. Consiste en: **Educar, Observar, Documentar, Orientar, Prevenir, Acompañar y Sanar**.

La educación capilar constituye una de las herramientas más importantes del método. Cuando una persona entiende cómo funciona su cabello, comienza a tomar decisiones más saludables. Y cuando mejora sus hábitos, la salud capilar también mejora.

---

## EL DAÑO MECÁNICO Y LA TRICOPTILOSIS

- **Daño Mecánico**: Se refiere a todas las agresiones físicas que recibe la fibra capilar (cepillado agresivo, fricción excesiva, tracción constante, peinados tensos). Producen microfracturas acumulativas manifestadas como frizz, quiebre y falta de crecimiento visible.
- **Tricoptilosis**: Término técnico para describir las puntas abiertas. Dentro del método constituye una evidencia visible de daño estructural y pérdida de integridad en la fibra.
      `,
      summaryText: 'El Método Cabello de Luna® busca preservar la salud capilar promoviendo la prevención del daño mecánico y químico bajo el principio "Menos es más".',
      glossaryJson: [
        { term: 'Tricología Cosmética', definition: 'Disciplina enfocada en la observación y cuidado cosmético del cabello y cuero cabelludo.' },
        { term: 'Tricoptilosis', definition: 'Apertura longitudinal de la fibra capilar conocida comúnmente como punta abierta.' },
        { term: 'Fibra Capilar', definition: 'Estructura visible del cabello compuesta principalmente por queratina.' },
        { term: 'Preservación Capilar', definition: 'Acciones destinadas a conservar la integridad estructural del cabello.' },
        { term: 'Daño Mecánico', definition: 'Deterioro ocasionado por fuerzas físicas repetitivas como fricción o tracción.' },
      ],
      practicalCaseJson: {
        title: 'Caso Práctico de Estudio',
        description: 'María, de 29 años, refiere que su cabello "no crece". Durante la observación se detecta: uso diario de plancha, cepillado agresivo, coleta tirante para dormir y puntas abiertas visibles.',
        questions: [
          '¿Cuál podría ser el principal factor relacionado con el problema?',
          '¿Existe evidencia de daño mecánico?',
          '¿Qué hábitos deberían modificarse en la rutina diaria de María?',
        ],
      },
      practicalActivityJson: {
        title: 'Actividad Práctica Guiada',
        instructions: 'Observa tu propio cabello o el de una persona cercana e identifica: presencia de frizz, puntas abiertas, signos de quiebre, uso de calor y frecuencia de cepillado. Elabora un reporte inicial de observación y describe 3 hábitos a mejorar.',
      },
    },
    create: {
      id: 'mod-1',
      month: 1,
      week: 1,
      title: 'Introducción al Método Cabello de Luna®',
      description: 'Fundamentos del método, filosofía "Menos es más", análisis del daño mecánico y prevención de tricoptilosis.',
      avatarId: marianaAvatar.id,
      level: 'Técnico Profesional',
      instructorName: 'Especialista en Tricología Cosmética y Tricotilosis – Método Cabello de Luna®',
      totalDurationMinutes: 20,
      objectivesJson: [
        'Definir qué es el Método Cabello de Luna®.',
        'Comprender la filosofía de preservación capilar.',
        'Reconocer el papel del Técnico Especialista en Tricología Cosmética y Tricotilosis.',
        'Comprender la importancia de la observación integral del cabello.',
        'Identificar los principales factores que deterioran la fibra capilar.',
        'Entender el enfoque multidisciplinario del método.',
      ],
      competenciesJson: [
        'Observar el cabello desde una perspectiva integral.',
        'Identificar factores mecánicos que afectan la salud capilar.',
        'Reconocer señales que requieren derivación profesional.',
        'Comprender la relación entre cuero cabelludo, folículo piloso y fibra capilar.',
        'Aplicar los principios fundamentales del Método Cabello de Luna®.',
      ],
      contentMarkdown: `
# INTRODUCCIÓN AL MÉTODO CABELLO DE LUNA®

Bienvenido al Instituto Latinoamericano de Tricología Cosmética y Tricotilosis. Has iniciado una formación diseñada para comprender el cabello desde una perspectiva diferente a la utilizada tradicionalmente por la industria estética.

Durante muchos años, la atención se ha centrado en modificar la apariencia del cabello mediante procedimientos químicos, herramientas térmicas y técnicas de transformación estética. Sin embargo, pocas veces se analiza una pregunta fundamental:

### ¿Está realmente sano el cabello?

El Método Cabello de Luna® surge para responder esta pregunta. Su objetivo principal es regresar el cabello a su estado natural después de haber sido procesado, maltratado y en algunos casos destruido. Su objetivo es **preservar su salud**.

Porque un cabello saludable conserva naturalmente:
- **Brillo natural**
- **Elasticidad**
- **Movimiento**
- **Resistencia**
- **Suavidad**

Cuando la fibra capilar pierde estas características, comienza un proceso de deterioro progresivo que puede manifestarse como frizz, quiebre, puntas abiertas o pérdida de longitud visible.

Por esta razón, la filosofía del Método Cabello de Luna® se basa en **sanar, prevenir y preservar la salud capilar**.

---

## ¿QUÉ ES EL MÉTODO CABELLO DE LUNA®?

El Método Cabello de Luna® es un sistema integral de restauración capilar que busca conservar la integridad de la fibra mediante la observación, la educación y la corrección de hábitos que generan daño.

A diferencia de otros enfoques, el método entiende que el cabello además de dañarse por un proceso químico, la mayor parte del daño ocurre diariamente a través de acciones aparentemente simples como:

- Dormir con el cabello mojado.
- Cepillar incorrectamente.
- Utilizar calor excesivo.
- Recoger el cabello húmedo.
- Utilizar extensiones o mantener peinados tirantes.
- Someter constantemente la fibra a fricción.
- Tratamientos alisantes y decoloraciones.

Estas agresiones pueden parecer insignificantes cuando ocurren una sola vez. Sin embargo, cuando se repiten durante meses o años terminan generando un deterioro acumulativo.

---

## LA FILOSOFÍA DEL MÉTODO: MENOS ES MÁS

El principio central del Método Cabello de Luna® puede resumirse en una frase:

# MENOS ES MÁS

- **Mientras menos agresiones reciba la fibra**: Mayor será su capacidad de conservación.
- **Mientras menos calor reciba**: Mayor será su resistencia.
- **Mientras menos químicos reciba**: Mayor será su integridad estructural.
- **Mientras menos tracción soporte**: Mayor será su capacidad de crecimiento visible.

La restauración comienza cuando detenemos el daño.

---

## EL CABELLO ADEMÁS DE CRECER MÁS, NECESITA ROMPERSE MENOS

Uno de los conceptos más importantes del Método Cabello de Luna® es que muchas personas creen que su cabello no crece. Sin embargo, en la mayoría de los casos sí está creciendo: **lo que ocurre es que se rompe al mismo ritmo al que crece**.

Por ejemplo: Si un cabello crece un centímetro al mes, pero se rompe un centímetro al mes, la persona percibirá que nunca aumenta de longitud. Por ello, la preservación de la fibra es tan importante como el crecimiento del cabello. La misión del técnico especialista consiste en ayudar a conservar aquello que el organismo ya está produciendo.

---

## EL CABELLO COMO SISTEMA INTEGRAL

El Método Cabello de Luna® considera que el cabello forma parte de un sistema biológico compuesto por:
- Cuero cabelludo
- Folículo piloso
- Fibra capilar
- Hábitos cotidianos
- Factores ambientales
- Productos cosméticos

Observar únicamente la fibra visible es un error frecuente. El técnico especialista debe aprender a observar el sistema completo.

---

## EL ENFOQUE MULTIDISCIPLINARIO

Aunque el Técnico Especialista no realiza diagnósticos médicos, sí debe comprender factores básicos que pueden influir sobre la salud capilar. Por ello el método incorpora nociones generales de:

- **Dermatología**: Para reconocer alterations visibles del cuero cabelludo.
- **Nutrición**: Para comprender cómo la alimentación influye sobre la calidad del cabello.
- **Endocrinología**: Para reconocer posibles señales relacionadas con alteraciones hormonales.
- **Química Cosmética**: Para comprender cómo interactúan los productos cosméticos con la fibra capilar.

Este conocimiento permite realizar observaciones más completas y derivar oportunamente cuando sea necesario.

---

## LA MISIÓN DEL TÉCNICO ESPECIALISTA

El Técnico Especialista tiene una función muy clara. No consiste únicamente en observar el cabello. Consiste en: **Educar, Observar, Documentar, Orientar, Prevenir, Acompañar y Sanar**.

La educación capilar constituye una de las herramientas más importantes del método. Cuando una persona entiende cómo funciona su cabello, comienza a tomar decisiones más saludables. Y cuando mejora sus hábitos, la salud capilar también mejora.

---

## EL DAÑO MECÁNICO Y LA TRICOPTILOSIS

- **Daño Mecánico**: Se refiere a todas las agresiones físicas que recibe la fibra capilar (cepillado agresivo, fricción excesiva, tracción constante, peinados tensos). Producen microfracturas acumulativas manifestadas como frizz, quiebre y falta de crecimiento visible.
- **Tricoptilosis**: Término técnico para describir las puntas abiertas. Dentro del método constituye una evidencia visible de daño estructural y pérdida de integridad en la fibra.
      `,
      summaryText: 'El Método Cabello de Luna® busca preservar la salud capilar promoviendo la prevención del daño mecánico y químico bajo el principio "Menos es más".',
      glossaryJson: [
        { term: 'Tricología Cosmética', definition: 'Disciplina enfocada en la observación y cuidado cosmético del cabello y cuero cabelludo.' },
        { term: 'Tricoptilosis', definition: 'Apertura longitudinal de la fibra capilar conocida comúnmente como punta abierta.' },
        { term: 'Fibra Capilar', definition: 'Estructura visible del cabello compuesta principalmente por queratina.' },
        { term: 'Preservación Capilar', definition: 'Acciones destinadas a conservar la integridad estructural del cabello.' },
        { term: 'Daño Mecánico', definition: 'Deterioro ocasionado por fuerzas físicas repetitivas como fricción o tracción.' },
      ],
      practicalCaseJson: {
        title: 'Caso Práctico de Estudio',
        description: 'María, de 29 años, refiere que su cabello "no crece". Durante la observación se detecta: uso diario de plancha, cepillado agresivo, coleta tirante para dormir y puntas abiertas visibles.',
        questions: [
          '¿Cuál podría ser el principal factor relacionado con el problema?',
          '¿Existe evidencia de daño mecánico?',
          '¿Qué hábitos deberían modificarse en la rutina diaria de María?',
        ],
      },
      practicalActivityJson: {
        title: 'Actividad Práctica Guiada',
        instructions: 'Observa tu propio cabello o el de una persona cercana e identifica: presencia de frizz, puntas abiertas, signos de quiebre, uso de calor y frecuencia de cepillado. Elabora un reporte inicial de observación y describe 3 hábitos a mejorar.',
      },
    },
  });

  // 5. Autoevaluación interactiva con las 5 preguntas oficiales del PDF
  await prisma.evaluation.upsert({
    where: { id: 'eval-1' },
    update: {},
    create: {
      id: 'eval-1',
      moduleId: module1.id,
      title: 'Autoevaluación: Introducción al Método Cabello de Luna®',
      passingScore: 7,
      totalQuestions: 5,
      questions: {
        create: [
          {
            text: '¿Cuál es el objetivo principal del Método Cabello de Luna®?',
            options: ['Transformar el cabello.', 'Preservar la salud capilar.', 'Cambiar la textura.', 'Modificar el color.'],
            correctAnswerIndex: 1,
            explanation: 'El objetivo primordial del método es preservar la integridad y salud capilar.',
          },
          {
            text: 'El principio central del método es:',
            options: ['Más tratamientos.', 'Más productos.', 'Menos es más.', 'Más procedimientos.'],
            correctAnswerIndex: 2,
            explanation: 'Mientras menos agresiones reciba la fibra capilar, mayor será su conservación.',
          },
          {
            text: 'La tricoptilosis corresponde técnicamente a:',
            options: ['Caspa.', 'Alopecia.', 'Punta abierta.', 'Seborrea.'],
            correctAnswerIndex: 2,
            explanation: 'Tricoptilosis es la apertura longitudinal de la fibra capilar (punta abierta).',
          },
          {
            text: 'El daño mecánico en la fibra capilar puede ser provocado por:',
            options: ['Fricción y tracción.', 'Oxígeno.', 'Agua pura.', 'Nutrientes.'],
            correctAnswerIndex: 0,
            explanation: 'Las agresiones físicas como el cepillado agresivo o peinados tirantes provocan daño mecánico.',
          },
          {
            text: 'La principal herramienta del Técnico Especialista es:',
            options: ['Diagnóstico médico.', 'Medicación.', 'Observación.', 'Cirugía.'],
            correctAnswerIndex: 2,
            explanation: 'La observación minuciosa de la fibra y el estilo de vida del cliente es la herramienta principal.',
          },
        ],
      },
    },
  });

  // 6. Prácticas Clínicas y Modelos Reales (70 cortes)
  await prisma.practicalModel.upsert({
    where: { id: 'model-sofia-1' },
    update: {},
    create: {
      id: 'model-sofia-1',
      userId: student.id,
      modelNumber: 1,
      modelName: 'Camila Ramírez',
      lunarPhaseAssigned: 'Cuarto Creciente',
      status: 'IN_PROGRESS',
      cuts: {
        create: [
          {
            cutNumber: 1,
            lunarPhase: 'Cuarto Creciente',
            status: CutStatus.APPROVED,
            submittedAt: new Date(),
            evidence: {
              create: {
                photoBeforeUrl: 'https://cdn.iltct.com/models/1-before.jpg',
                photoAfterUrl: 'https://cdn.iltct.com/models/1-after.jpg',
                technicalSheetText: 'Corte de 1.5cm de puntas dañadas en Luna Creciente.',
              },
            },
          },
        ],
      },
    },
  });

  console.log('Sembrado de datos pedagógicos completos finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
