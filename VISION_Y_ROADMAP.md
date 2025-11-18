# API Calefacción - Visión y Roadmap del Proyecto

## 📋 Índice
1. [Visión General](#visión-general)
2. [Ventaja Competitiva](#ventaja-competitiva)
3. [Estrategia Multi-Mercado](#estrategia-multi-mercado)
4. [Funcionalidades Planificadas](#funcionalidades-planificadas)
5. [Modelo de Negocio](#modelo-de-negocio)
6. [Roadmap de Desarrollo](#roadmap-de-desarrollo)
7. [Stack Tecnológico](#stack-tecnológico)

---

## 🎯 Visión General

**Objetivo:** Crear la primera plataforma integral para diseño, cálculo, diagnóstico y mantenimiento de sistemas de calefacción, combinando diseño CAD, cálculos termohidráulicos, datos reales de sensores IoT y 200+ casos reales documentados.

**Diferenciación clave:**
- ✅ Única app que combina diseño + cálculos + diagnóstico + IoT
- ✅ Base de conocimiento con 200 casos reales de obra
- ✅ Adaptada a mercados específicos (Argentina + Europa)
- ✅ Integración con hardware de diagnóstico (termografía, sensores)

**Creador:** Técnico en sistemas de calefacción con +20 años de experiencia y 200+ obras documentadas.

---

## 🏆 Ventaja Competitiva

### Lo que NO existe en el mercado:
1. **App de diseño CAD** → Solo dibujo, sin cálculos
2. **Calculadoras online** → Solo números, sin visualización
3. **Software profesional caro** → Sin IoT ni diagnóstico, caros (€500-2000/licencia)

### Lo que NOSOTROS ofrecemos:
1. ✅ Diseño visual en canvas 2D
2. ✅ Cálculos termohidráulicos automáticos
3. ✅ Diagnóstico con IA basado en experiencia real
4. ✅ Integración con sensores IoT y termografía
5. ✅ Base de datos de 200+ casos reales
6. ✅ Suelo radiante + radiadores tradicionales
7. ✅ Multi-mercado (Argentina + Europa)
8. ✅ Presupuestos automáticos
9. ✅ Formación integrada
10. ✅ Modelo SaaS accesible

**Nadie tiene todo esto junto.**

---

## 🌍 Estrategia Multi-Mercado

### Argentina (Laboratorio + Validación)
**Características del mercado:**
- Construcción caótica, falta de normalización
- Instaladores con poca formación técnica
- Datos de edificios inexistentes o no fiables
- Necesidad de herramientas pragmáticas

**Estrategia:**
- MVP inicial con valores basados en experiencia real
- Casos de las 200 obras como base de conocimiento
- Precios accesibles (ARS 2,999/mes ≈ €3)
- Enfoque en diagnóstico con herramientas externas
- Validación con instaladores locales

**Ventaja única:**
- Único con experiencia local real documentada
- Conocimiento del mercado argentino específico

### España (Primer mercado europeo)
**Características:**
- Normativa RITE (Reglamento Instalaciones Térmicas)
- Mercado profesionalizado
- Demanda de suelo radiante
- Integración con aerotermia/geotermia

**Adaptaciones:**
- Cumplimiento automático RITE
- Catálogo fabricantes españoles (Ferroli, Roca, Vaillant, Junkers)
- Diseño automático suelo radiante
- Certificación energética
- Precio: €49-149/mes

### Alemania (Mercado premium)
**Características:**
- Normativa DIN muy estricta
- Altísima adopción suelo radiante
- Mayor poder adquisitivo
- Exigencia técnica máxima

**Adaptaciones:**
- Cumplimiento DIN EN 12831
- Traducción profesional alemán
- Énfasis en eficiencia energética
- Integración con sistemas KNX
- Precio premium: €59-179/mes

### Italia, Francia, UK (Expansión posterior)
- Adaptación a normativas UNI, RT, Building Regulations
- Partners locales
- Traducción profesional

---

## 🛠️ Funcionalidades Planificadas

### FASE 1: MVP Básico (ACTUAL - En desarrollo)
**Estado: 50% completado**

✅ **Ya implementado:**
- [x] Canvas 2D para diseño
- [x] Colocación de radiadores
- [x] Colocación de calderas
- [x] Trazado de tuberías (polilíneas)
- [x] Snap automático a elementos (threshold 20px)
- [x] Preview en tiempo real
- [x] Doble-clic para finalizar tubería
- [x] Botón "Finalizar Tubería"
- [x] Escape para cancelar
- [x] Selección de elementos
- [x] Eliminación con Delete/Backspace
- [x] Selección de tuberías (visualización naranja)
- [x] Cálculo automático de longitud de tuberías
- [x] Botón "Limpiar Todo"
- [x] Detección de snap a radiadores/calderas

⏳ **Pendiente (según roadmap ChatGPT):**
- [ ] Panel de propiedades (editar potencia, diámetros, etc.)
- [ ] Guardar/cargar proyectos (JSON local)
- [ ] Exportar a PDF básico
- [ ] Cálculos básicos de potencia total
- [ ] Validación básica (caldera suficiente para radiadores)

### FASE 2: Tuberías Avanzadas
**Prioridad: Alta**

- [ ] Diferenciar tubería IDA (rojo) vs RETORNO (azul celeste)
- [ ] Selector de tipo de tubería en toolbar
- [ ] Visualización de cruces de tuberías (gap o puente)
- [ ] Z-index para ordenar tuberías
- [ ] Botones "Traer al frente" / "Enviar atrás"
- [ ] Cálculo de diámetro automático según demanda
- [ ] Sugerencia de diámetro comercial (12, 16, 20, 25mm)
- [ ] Detección de sistema (bitubo, monotubo, colector)
- [ ] Cálculo de caudales en paralelo
- [ ] Validación de velocidad agua (<1.5 m/s)
- [ ] Cálculo de pérdida de carga

### FASE 3: Catálogo de Productos
**Prioridad: Alta**

**Estructura:**
```typescript
// Radiadores
- Aluminio (600, 800, 1000mm)
- Acero (600, 800, 1000mm)
- Toallero
- Datos: potencia, precio, fabricante

// Calderas
- Condensación (20, 24, 30kW)
- Atmosférica (20, 24kW)
- Mixta (agua caliente sanitaria)
- Datos: potencia, eficiencia, precio, fabricante

// Tuberías
- PEX (12, 16, 20, 25mm)
- Cobre (12, 15, 18, 22mm)
- Multicapa (16, 20mm)
- Datos: diámetro, material, precio/metro
```

**Funcionalidades:**
- [ ] Menú desplegable para seleccionar producto antes de colocar
- [ ] Panel de propiedades permite cambiar producto después
- [ ] Catálogos regionales (Argentina vs España vs Alemania)
- [ ] Actualización de precios desde API

### FASE 4: Cálculos Térmicos
**Prioridad: Media-Alta**

**Datos de entrada:**
- [ ] Ubicación (ciudad → temperatura exterior de diseño)
- [ ] Tipo de edificio (antiguo, estándar, moderno)
- [ ] Por habitación: volumen, aislamiento, ventanas, orientación

**Cálculos automáticos:**
- [ ] Pérdidas térmicas por habitación (Q = V × K × ΔT)
- [ ] Potencia requerida por radiador
- [ ] Validación: radiador subdimensionado/sobredimensionado
- [ ] Potencia total vs potencia caldera
- [ ] Caudal necesario por tubería
- [ ] Diámetro óptimo de tubería
- [ ] Pérdida de carga del circuito
- [ ] Validación de bomba circuladora

**Base de datos climática:**
```typescript
Argentina: {
  buenosAires: -2°C,
  cordoba: -3°C,
  mendoza: -5°C
}
España: {
  madrid: -3°C,
  barcelona: 0°C,
  bilbao: -1°C
}
Alemania: {
  berlin: -14°C,
  munich: -18°C
}
```

### FASE 5: Diagnóstico Automático
**Prioridad: Alta (Diferenciador clave)**

**Análisis de instalaciones existentes:**
- [ ] Detección de radiadores subdimensionados
- [ ] Detección de tuberías subdimensionadas (velocidad >1.5 m/s)
- [ ] Detección de pérdida de carga excesiva (>100 Pa/m)
- [ ] Detección de desbalance hidráulico
- [ ] Detección de caldera sobredimensionada/subdimensionada
- [ ] Análisis de topología del sistema (grafo de conexiones)
- [ ] Identificación de ramales problemáticos

**Problemas comunes diagnosticados:**
- "Algunos radiadores no calientan" → Desbalance hidráulico
- "Factura de gas muy alta" → Caldera sobredimensionada, tuberías sin aislar
- "Ruidos en la instalación" → Velocidad excesiva (>1.5 m/s)
- "Radiadores tardan en calentar" → Longitud excesiva, caudal insuficiente

**Informe de diagnóstico:**
```
⚠️ PROBLEMAS DETECTADOS:

1. Radiador Habitación 3: 800W instalado, 1200W necesario
   → Solución: Cambiar por radiador 1200W
   → Costo estimado: €80

2. Tubería principal: Ø16mm con caudal 250 l/h
   → Velocidad: 2.3 m/s (excesiva, max 1.5 m/s)
   → Pérdida carga: 180 Pa/m (excesiva, max 100 Pa/m)
   → Solución: Cambiar a Ø20mm
   → Costo estimado: €120

3. Caldera 35kW para demanda total 18kW
   → Sobredimensionada (rendimiento bajo)
   → Solución: Cambiar a caldera modulante 20-24kW
   → Ahorro estimado: €300/año
   → ROI: 4 años
```

### FASE 6: Integración IoT y Sensores
**Prioridad: Alta (Diferenciador brutal)**

**A. Cámara termográfica:**
- [ ] Importar imagen termográfica (TESTO, FLIR)
- [ ] Superponer sobre plano del proyecto
- [ ] Detección automática de anomalías:
  - Fugas (puntos calientes inesperados)
  - Tuberías sin aislar (pérdida térmica)
  - Radiadores fríos (no llega caudal)
- [ ] Correlación con elementos dibujados
- [ ] Informe con fotos térmicas

**B. Sensores de temperatura Bluetooth/WiFi:**
- [ ] Conexión con sensores vía Web Bluetooth API
- [ ] Monitoreo en tiempo real
- [ ] Visualización en canvas (iconos con temperatura)
- [ ] Alertas automáticas (temperatura fuera de rango)
- [ ] Comparación temperatura real vs calculada
- [ ] Histórico de mediciones

**C. Medidores de caudal:**
- [ ] Importar datos de caudalímetros
- [ ] Comparación caudal real vs diseño
- [ ] Detección de obstrucciones

**D. Manómetros digitales:**
- [ ] Monitoreo de presión del sistema
- [ ] Alertas de presión baja/alta
- [ ] Validación de bomba circuladora

**E. Analizador de gases (calderas):**
- [ ] Importar datos de combustión
- [ ] Cálculo de eficiencia real
- [ ] Recomendaciones de ajuste

**Kit de diagnóstico:**
```
Hardware incluido:
- 5x Sensores temperatura Bluetooth (€75)
- Termómetro infrarrojo (€30)
- App smartphone termografía (€200)
Total: ~€300

Venta: €399 + suscripción Premium
```

### FASE 7: Suelo Radiante
**Prioridad: Media-Alta (Muy demandado en Europa)**

**Diseño automático:**
- [ ] Herramienta "Suelo Radiante" en toolbar
- [ ] Dibujar perímetro de habitación
- [ ] Cálculo automático de separación (10, 15, 20cm) según demanda
- [ ] Generación automática de serpentín o espiral
- [ ] Cálculo de longitud por circuito (max 80-100m)
- [ ] Diseño de colector con puertos numerados
- [ ] Validación de pérdida de carga
- [ ] Exportar plano de instalación

**Cálculos específicos:**
```typescript
Potencia por m² según separación:
- 10cm → ~100 W/m² (zonas frías)
- 15cm → ~80 W/m² (estándar)
- 20cm → ~60 W/m² (zonas templadas)

Temperatura de trabajo: 35-45°C
Material: PEX o Multicapa
Diámetros: 16mm, 20mm
```

**Comparativa automática:**
- [ ] Radiadores vs Suelo radiante
- [ ] Costos instalación
- [ ] Eficiencia energética
- [ ] Confort
- [ ] ROI (retorno inversión)

### FASE 8: Carga de Planos
**Prioridad: Media**

- [ ] Cargar imagen de plano (PNG, JPG, PDF→imagen)
- [ ] Ajustar escala (definir metros por píxel)
- [ ] Imagen de fondo en canvas
- [ ] Control de opacidad
- [ ] Zoom y pan
- [ ] Diseñar instalación sobre el plano
- [ ] Exportar plano + instalación

### FASE 9: Diseño Automático con IA
**Prioridad: Baja (Fase avanzada)**

**Algoritmo de diseño automático:**
- [ ] Usuario marca habitaciones en plano
- [ ] Cálculo automático potencia por habitación
- [ ] Ubicación automática de radiadores (bajo ventanas)
- [ ] Ubicación automática de caldera (zona técnica)
- [ ] Ruteo automático de tuberías (algoritmo A*)
- [ ] Evitar obstáculos detectados
- [ ] Optimización de longitud total
- [ ] Generación de IDA y RETORNO
- [ ] Balanceo automático de ramales
- [ ] Dimensionado automático de diámetros

**IA de aprendizaje:**
- [ ] Entrenar con 200+ casos reales documentados
- [ ] Aprender de soluciones aplicadas
- [ ] Mejorar sugerencias con el tiempo

### FASE 10: Presupuestos Automáticos
**Prioridad: Alta**

**Cálculo automático:**
```
Materiales:
- 5x Radiador Aluminio 600mm @ €45 = €225
- 1x Caldera Condensación 24kW @ €1,200 = €1,200
- 45m PEX 16mm @ €2.50/m = €112.50
- Válvulas, codos, soportes (automático)

Mano de obra:
- Instalación radiadores: 7h @ €40/h = €280
- Instalación caldera: 4h @ €50/h = €200
- Instalación tuberías: 8h @ €40/h = €320

TOTAL: €2,812.50
```

**Funcionalidades:**
- [ ] Cálculo automático de materiales
- [ ] Estimación de accesorios según conexiones
- [ ] Cálculo de mano de obra según complejidad
- [ ] Precios actualizados desde catálogo
- [ ] Exportar presupuesto a PDF
- [ ] Personalización de precios por región
- [ ] Márgenes configurables

### FASE 11: Base de Conocimiento (Casos Reales)
**Prioridad: Alta (Activo más valioso)**

**Documentación de 200+ casos:**
```typescript
interface RealCase {
  id: string;
  location: string; // "Buenos Aires, Palermo"
  year: number;
  buildingType: string; // "Edificio 1950, 8 pisos"
  problem: string; // "Radiadores planta baja no calentaban"
  diagnosis: string; // "Desbalance hidráulico"
  solution: string; // "Rebalanceo + válvulas equilibrado"
  beforeData?: {
    temps: number[];
    complaints: string[];
  };
  afterData?: {
    temps: number[];
    satisfaction: number;
  };
  cost: number;
  timeSpent: string;
  photos?: string[];
  thermalImages?: string[];
  lessons: string[]; // Lecciones aprendidas
  tags: string[]; // "desbalance", "tubería", "radiadores"
}
```

**Funcionalidades:**
- [ ] Buscador de casos similares
- [ ] Filtro por problema, tipo edificio, región
- [ ] Visualización de soluciones aplicadas
- [ ] Fotos y datos térmicos
- [ ] "Sugerencias basadas en casos similares"
- [ ] Formación interactiva con casos reales

**Valor para usuarios:**
- Estudiantes aprenden con casos reales
- Instaladores ven soluciones probadas
- Evitan errores comunes
- Justifican soluciones a clientes

### FASE 12: Formación y Certificación
**Prioridad: Media (Ingresos adicionales)**

**Cursos online:**
- [ ] "Los 10 errores más comunes en 200 obras"
- [ ] "Diagnóstico de radiadores fríos en 5 pasos"
- [ ] "Presupuestar sin perder dinero"
- [ ] "Diseño de suelo radiante paso a paso"
- [ ] "Cálculos termohidráulicos prácticos"

**Certificación profesional:**
- [ ] "Instalador Certificado API Calefacción"
- [ ] Examen teórico-práctico
- [ ] Badge digital
- [ ] Valor en mercado (aumenta facturación)

**Modelo:**
- Cursos: €99-199 cada uno
- Certificación: €299
- Recertificación anual: €99

---

## 💰 Modelo de Negocio

### Tiers de Suscripción

#### **Tier GRATUITO (Educativo)**
**Precio:** €0/mes

**Funcionalidades:**
- ✓ Diseño manual básico (canvas)
- ✓ Hasta 3 proyectos guardados
- ✓ Cálculos básicos con valores por defecto
- ✓ No guarda en nube (solo local)
- ✓ Exportar con marca de agua
- ✓ Acceso a 10 casos de estudio

**Objetivo:** 
- Captar estudiantes y usuarios casuales
- Validación del producto
- Marketing viral (boca a boca)

---

#### **Tier PROFESIONAL**

**Argentina:** ARS 2,999/mes (~€3)
**España:** €49/mes
**Alemania:** €59/mes

**Funcionalidades:**
- ✓ Todo lo gratuito +
- ✓ Proyectos ilimitados
- ✓ Guardado en nube
- ✓ Cálculos termohidráulicos completos
- ✓ Catálogo completo de productos
- ✓ Presupuestos automáticos
- ✓ Exportar PDF sin marca de agua
- ✓ Acceso a todos los casos de estudio (200+)
- ✓ Soporte por email
- ✓ Actualizaciones de precios mensuales

**Mercado objetivo:**
- Instaladores independientes
- Pequeñas empresas
- Técnicos freelance

---

#### **Tier PREMIUM (Pro + IoT)**

**Argentina:** ARS 9,999/mes (~€10)
**España:** €149/mes
**Alemania:** €179/mes

**Funcionalidades:**
- ✓ Todo Profesional +
- ✓ **Diagnóstico automático con IA**
- ✓ **Integración con sensores IoT**
- ✓ **Importar datos termográficos**
- ✓ **Diseño automático de suelo radiante**
- ✓ **Diseño semi-automático con IA**
- ✓ Alertas en tiempo real
- ✓ Informes de eficiencia energética
- ✓ Análisis de ROI detallado
- ✓ Soporte prioritario (chat/teléfono)
- ✓ Formación exclusiva (webinars)
- ✓ API para integraciones

**Mercado objetivo:**
- Empresas instaladoras medianas
- Estudios de ingeniería
- Auditores energéticos
- Mantenedoras de edificios

---

#### **Tier EMPRESA**

**Precio:** €299-499/mes (negociable)

**Funcionalidades:**
- ✓ Todo Premium +
- ✓ **Usuarios ilimitados** (equipos)
- ✓ **White label** (tu marca)
- ✓ **API completa** para integración ERP/CRM
- ✓ **Catálogo personalizado** con tus productos
- ✓ **Comisiones automáticas** por ventas
- ✓ Soporte dedicado
- ✓ Capacitación in-company
- ✓ Dashboard de métricas empresariales
- ✓ SLA garantizado

**Mercado objetivo:**
- Grandes empresas instaladoras
- Distribuidores de materiales
- Fabricantes (Ferroli, Roca, etc.)
- Cadenas de instalación

---

### Ingresos Adicionales

#### **1. Hardware (Kit de Diagnóstico)**
**Contenido:**
- 5x Sensores temperatura Bluetooth
- Termómetro infrarrojo
- App smartphone con termografía
- Maletín profesional

**Costo:** €300 (fabricación)
**Venta:** €499 + suscripción Premium obligatoria
**Margen:** €199 por kit

**Objetivo:** 100 kits/año = €19,900

---

#### **2. Marketplace de Productos**
**Modelo:**
- Usuario compra materiales desde la app
- Enviamos orden a distribuidor
- Comisión: 2-5% sobre venta

**Ejemplo:**
- Instalación tipo: €3,000 en materiales
- Comisión 3%: €90 por proyecto
- 50 proyectos/mes = €4,500/mes adicionales

---

#### **3. Formación y Certificación**
**Cursos individuales:** €99-199
**Paquete completo:** €499
**Certificación profesional:** €299
**Recertificación anual:** €99

**Objetivo:** 200 certificados/año = €59,800

---

#### **4. Marketplace de Plantillas**
- Usuarios profesionales venden sus diseños
- Comisión: 30% de cada venta
- Plantillas: €5-50 cada una

---

#### **5. White Label / Licencias**
- Vender plataforma white label a distribuidores
- Licencia anual: €10,000-50,000
- Personalización: €5,000-20,000 one-time

---

### Proyección de Ingresos

#### **Año 1: MVP en Argentina**
```
50 usuarios Pro (€3/mes):      €150/mes
10 usuarios Premium (€10/mes): €100/mes
Hardware:                       €0
Formación:                      €0
TOTAL AÑO 1:                    €3,000
```
*Objetivo: Validación y refinamiento*

---

#### **Año 2: Expansión España**
```
Argentina:
- 100 usuarios Pro:              €300/mes
- 20 usuarios Premium:           €200/mes

España:
- 200 usuarios Pro (€49/mes):    €9,800/mes
- 30 usuarios Premium (€149/mes): €4,470/mes

Hardware (50 kits):              €830/mes
Formación:                        €4,000/mes
TOTAL AÑO 2:                     €234,000
```

---

#### **Año 3: Europa Central**
```
Argentina + España:              €14,770/mes
Alemania (150 Pro + 40 Premium): €15,010/mes
Italia (100 Pro + 20 Premium):   €7,880/mes

Hardware (100 kits):             €1,650/mes
Formación y certificación:       €10,000/mes
Marketplace comisiones:          €4,500/mes
TOTAL AÑO 3:                     €647,880
```

---

#### **Año 4-5: Madurez**
```
Usuarios totales:
- 1,000 Pro                       €49,000/mes
- 200 Premium                     €29,800/mes
- 20 Empresas                     €5,980/mes

Hardware (200 kits):              €3,300/mes
Formación:                        €15,000/mes
Marketplace:                      €10,000/mes
White label (5 clientes):         €4,170/mes

TOTAL MENSUAL:                    €117,250/mes
TOTAL ANUAL:                      €1,407,000
```

---

## 📅 Roadmap de Desarrollo

### **Q4 2024 - Q1 2025: Fundación (ACTUAL)**
**Objetivo:** MVP funcional básico

✅ Completado:
- [x] Estructura del proyecto
- [x] Canvas básico
- [x] Radiadores y calderas
- [x] Sistema de tuberías completo
- [x] Selección y eliminación
- [x] Cálculo de longitudes

🔄 En progreso:
- [ ] Panel de propiedades
- [ ] Guardar/cargar proyectos
- [ ] Primeros cálculos térmicos

**Hitos:**
- ✓ Commit 1: Estructura inicial + radiadores
- ✓ Commit 2: Calderas
- ✓ Commit 3: Sistema completo de tuberías
- ⏳ Commit 4: Panel de propiedades + guardar/cargar

---

### **Q2 2025: Refinamiento MVP**
**Objetivo:** App usable en Argentina

Tareas:
- [ ] Tuberías IDA/RETORNO con colores
- [ ] Catálogo básico de productos argentinos
- [ ] Cálculos térmicos con datos argentinos
- [ ] Presupuestos básicos
- [ ] Exportar PDF
- [ ] Primeros 20 casos reales documentados
- [ ] Testing con instaladores argentinos

**Hito:** Primera versión productiva en Argentina

---

### **Q3 2025: Diagnóstico Básico**
**Objetivo:** Sistema de diagnóstico sin IoT

Tareas:
- [ ] Análisis de topología (grafos)
- [ ] Detección radiadores subdimensionados
- [ ] Detección tuberías subdimensionadas
- [ ] Validación caldera
- [ ] Informe de diagnóstico PDF
- [ ] 50 casos reales documentados

**Hito:** Lanzamiento Tier Premium en Argentina

---

### **Q4 2025: Preparación Europa**
**Objetivo:** Adaptación normativa española

Tareas:
- [ ] Implementar cálculos según RITE
- [ ] Catálogo fabricantes españoles
- [ ] Traducción ES-ES
- [ ] Precios en EUR
- [ ] Diseño básico suelo radiante
- [ ] Marketing digital España
- [ ] Landing page en español

**Hito:** Lanzamiento en España

---

### **Q1 2026: IoT y Sensores**
**Objetivo:** Integración hardware

Tareas:
- [ ] Web Bluetooth API para sensores
- [ ] Importación imágenes termográficas
- [ ] Dashboard de monitoreo real-time
- [ ] Alertas automáticas
- [ ] Correlación datos térmicos con diseño
- [ ] Desarrollo kit de diagnóstico
- [ ] Acuerdo con fabricante sensores

**Hito:** Lanzamiento Tier Premium IoT

---

### **Q2-Q3 2026: Suelo Radiante Completo**
**Objetivo:** Herramienta líder en suelo radiante

Tareas:
- [ ] Diseño automático serpentín/espiral
- [ ] Cálculo separaciones automático
- [ ] Diseño de colector
- [ ] Validaciones específicas
- [ ] Comparativa radiadores vs suelo
- [ ] Exportar planos específicos
- [ ] 100 casos suelo radiante documentados

**Hito:** Referente en diseño suelo radiante Europa

---

### **Q4 2026: Expansión Alemania/Italia**
**Objetivo:** Multi-país consolidado

Tareas:
- [ ] Normativas DIN (Alemania) y UNI (Italia)
- [ ] Traducciones profesionales DE/IT
- [ ] Catálogos locales
- [ ] Partnerships distribuidores
- [ ] Marketing localizado
- [ ] Soporte en idiomas locales

**Hito:** 3 mercados activos (AR, ES, DE/IT)

---

### **2027: IA y Diseño Automático**
**Objetivo:** Diseño automático con IA

Tareas:
- [ ] Algoritmo A* para ruteo tuberías
- [ ] Ubicación automática elementos
- [ ] Optimización multi-objetivo
- [ ] Entrenar con 200+ casos reales
- [ ] ML para detección habitaciones en planos
- [ ] Múltiples propuestas de diseño
- [ ] Validación normativa automática

**Hito:** Primera app con diseño IA completo

---

### **2027-2028: Marketplace y Ecosistema**
**Objetivo:** Plataforma completa

Tareas:
- [ ] Marketplace de productos con comisiones
- [ ] Marketplace de plantillas
- [ ] API pública para integraciones
- [ ] White label para distribuidores
- [ ] Plugins para CAD profesional (AutoCAD, Revit)
- [ ] App móvil nativa
- [ ] Universidad online

**Hito:** Ecosistema completo, líder del mercado

---

## 🔧 Stack Tecnológico

### **Frontend (Actual)**
```
- React 18.2.0
- TypeScript 5.x
- Vite 5.0.8 (build tool)
- Zustand 4.4.7 (state management)
- Canvas API (renderizado 2D)
```

### **Futuro Frontend**
```
- React Router (navegación)
- TanStack Query (server state)
- Tailwind CSS (estilos)
- Shadcn/ui (componentes)
- Recharts (gráficos)
- React PDF (exportación)
- Web Bluetooth API (sensores)
```

### **Backend (A implementar)**
```
- Node.js + Express/Fastify
- PostgreSQL (datos estructurados)
- S3 o similar (almacenamiento archivos)
- Redis (cache)
- WebSockets (real-time)
- Stripe (pagos)
```

### **IA/ML (Futuro)**
```
- TensorFlow.js (diseño automático)
- OpenCV.js (análisis imágenes térmicas)
- Algoritmos grafos (A*, Dijkstra)
```

### **Infraestructura**
```
- Vercel/Railway (frontend)
- AWS/DigitalOcean (backend)
- Cloudflare (CDN)
- GitHub Actions (CI/CD)
```

### **Herramientas**
```
- Git/GitHub
- ESLint + Prettier
- Jest + Testing Library
- Playwright (E2E)
- Sentry (monitoring)
```

---

## 📊 Métricas de Éxito

### **Año 1 (Argentina MVP)**
- ✓ 100 usuarios registrados
- ✓ 50 usuarios de pago
- ✓ 20 casos reales documentados
- ✓ €3,000 ingresos anuales
- ✓ NPS > 40

### **Año 2 (España)**
- ✓ 500 usuarios totales
- ✓ 250 usuarios de pago
- ✓ 100 casos documentados
- ✓ €234,000 ingresos
- ✓ NPS > 50
- ✓ 10 testimonios en video

### **Año 3 (Europa)**
- ✓ 2,000 usuarios totales
- ✓ 1,000 usuarios de pago
- ✓ 200 casos documentados
- ✓ €647,880 ingresos
- ✓ NPS > 60
- ✓ 50 kits vendidos
- ✓ 1 partnership con fabricante

### **Año 4-5 (Madurez)**
- ✓ 10,000+ usuarios
- ✓ 1,500+ usuarios de pago
- ✓ €1.4M ingresos anuales
- ✓ 5 white labels activos
- ✓ Líder del mercado hispanohablante

---

## 🎓 Próximos Pasos Inmediatos

### **Esta semana:**
1. ✅ Documentar roadmap completo (este archivo)
2. ⏳ Continuar con instrucciones de ChatGPT para MVP
3. ⏳ Implementar panel de propiedades
4. ⏳ Sistema de guardar/cargar proyectos

### **Este mes:**
1. Completar MVP básico funcional
2. Testing con 3-5 instaladores argentinos
3. Documentar primeros 10 casos reales
4. Definir precios Argentina
5. Crear landing page simple

### **Este trimestre:**
1. Lanzamiento beta Argentina
2. 50 usuarios beta testers
3. Primeros 50 casos documentados
4. Primeros ingresos (aunque mínimos)
5. Roadmap detallado ChatGPT → Copilot integrado

---

## 📝 Notas y Decisiones

### **Decisiones de arquitectura:**
- ✓ Multi-mercado desde el inicio (no migrar después)
- ✓ Modular: fácil agregar nuevas funcionalidades
- ✓ API-first: todo preparado para futuras integraciones
- ✓ TypeScript everywhere: escalabilidad y mantenibilidad

### **Decisiones de negocio:**
- ✓ Freemium desde el inicio (captación)
- ✓ Argentina = validación, Europa = ingresos
- ✓ Hardware como diferenciador, no negocio principal
- ✓ 200 casos reales = activo más valioso

### **Decisiones de producto:**
- ✓ UX simple, funcionalidad compleja
- ✓ Datos reales > Cálculos teóricos
- ✓ Formación integrada (no app separada)
- ✓ Mobile-first responsive

---

## 🚀 Visión a 10 años

**2025-2027:** Líder hispanohablante
**2027-2030:** Referente europeo
**2030+:** Plataforma global multi-idioma

**Posible exit:**
- Adquisición por fabricante (Bosch, Vaillant, etc.)
- Adquisición por distribuidora grande
- Continuar independiente con ingresos recurrentes

---

**Última actualización:** 15 noviembre 2025
**Versión del documento:** 1.0
**Próxima revisión:** Después de completar MVP

---

*Este documento es la visión completa del proyecto basada en conversación con Edgardo (técnico con 20 años exp.) y análisis técnico-estratégico. Se actualizará conforme avance el proyecto.*
