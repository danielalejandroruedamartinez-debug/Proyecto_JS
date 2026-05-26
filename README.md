# 🚌 Rutas Seguras Kids - Sistema de Gestión de Rutas Escolares

## 📋 Descripción del Proyecto

**Rutas Seguras Kids** es un sistema frontend completo para la gestión de rutas escolares y asignación de estudiantes a buses. El proyecto demuestra dominio en manipulación del DOM, asincronía, Web Components y buenas prácticas de organización de código.

El sistema permite:
- ✅ Crear y gestionar rutas escolares dinámicamente
- ✅ Asignar estudiantes a rutas específicas
- ✅ Ver información del clima en tiempo real para cada ruta
- ✅ Validar datos del formulario
- ✅ Almacenar datos en localStorage
- ✅ Interfaz responsive y profesional

### Tecnologías Utilizadas
- **HTML5**: Estructura semántica
- **CSS3**: Diseño responsive con 4+ breakpoints
- **JavaScript Vanilla (ES6+)**: Sin frameworks externos
- **Web Components**: Custom elements y Shadow DOM
- **LocalStorage API**: Persistencia de datos
- **OpenWeather API** (alternativa Open-Meteo): Información del clima

---

## 🏗️ Estructura del Proyecto

```
Proyecto_JS/
├── index.html              # Estructura HTML principal
├── README.md              # Este archivo
├── Css/
│   └── styles.css         # Estilos responsive
└── JS/
    ├── app.js             # Lógica principal y Web Components
    ├── routes.js          # Gestor de rutas
    ├── students.js        # Gestor de estudiantes
    └── weather.js         # Integración de API del clima
```

---

## 🚀 Instrucciones de Instalación y Uso

### Requisitos Previos
- Navegador moderno (Chrome, Firefox, Safari, Edge) con soporte para:
  - ES6+ JavaScript
  - Web Components
  - LocalStorage
  - Fetch API

### Instalación

1. **Clonar o descargar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/Proyecto_JS.git
   cd Proyecto_JS
   ```

2. **Abrir el archivo en el navegador**
   - Opción A: Hacer doble clic en `index.html`
   - Opción B: Usar un servidor local
     ```bash
     # Con Python 3
     python -m http.server 8000
     
     # Con Node.js (http-server)
     npx http-server
     
     # Con Live Server en VS Code
     # Click derecho en index.html > "Open with Live Server"
     ```

3. **Acceder a la aplicación**
   ```
   http://localhost:8000 (o el puerto configurado)
   ```

---

## 📖 Guía de Uso

### 1. Crear una Nueva Ruta

1. En la sección "Nueva Ruta" (lado izquierdo), completa:
   - **Nombre de la Ruta**: Ej. "Ruta Centro"
   - **Conductor**: Nombre del conductor
   - **Hora de Salida**: Hora en formato HH:MM
   - **Ciudad**: Ciudad para obtener el clima

2. Haz clic en "Crear Ruta"

3. La ruta aparecerá en la sección "Rutas Activas" con:
   - Información del conductor y horario
   - Emoji del clima y temperatura actual
   - Número de estudiantes asignados

### 2. Agregar Estudiantes

1. En la sección "Nuevo Estudiante", completa:
   - **Nombre**: Nombre completo del estudiante
   - **Edad**: Entre 3 y 18 años
   - **Teléfono**: Teléfono de emergencia
   - **Asignar a Ruta**: (Opcional) Selecciona una ruta

2. Haz clic en "Agregar Estudiante"

3. Si no asignaste ruta, el estudiante aparecerá en "Estudiantes sin Asignar"

### 3. Asignar Estudiantes a Rutas

**Opción A: Al crear el estudiante**
- Selecciona una ruta en el dropdown "Asignar a Ruta"

**Opción B: Desde Estudiantes sin Asignar**
- Haz clic en "Asignar Ruta"
- Selecciona la ruta deseada de la lista modal

### 4. Ver Estudiantes de una Ruta

- Haz clic en "Ver Estudiantes" en cualquier tarjeta de ruta
- Se abrirá un modal con la tabla de estudiantes
- Desde ahí puedes remover estudiantes de la ruta

### 5. Eliminar Rutas o Estudiantes

- Haz clic en "Eliminar" en la tarjeta de la ruta o en la lista de estudiantes
- Confirma la acción cuando se te pida

---

## ✨ Características Principales

### 1. **Manipulación Dinámica del DOM**
- Renderización de rutas y estudiantes en tiempo real
- Actualización automática de la interfaz
- Creación de elementos HTML dinámicamente

### 2. **Web Components**
```javascript
// Componente <route-card> personalizado
<route-card route-id="route_123"></route-card>
```
- Shadow DOM para encapsulación de estilos
- Template y slots
- Ciclo de vida connectedCallback()

### 3. **Eventos Personalizados**
```javascript
// CustomEvent disparados por los módulos
- routeCreated
- routeDeleted
- studentCreated
- studentAssigned
- studentUnassigned
- studentDeleted
- weatherUpdated
```

### 4. **Asincronía y API**
```javascript
// Consumo de API Open-Meteo (sin API key requerida)
async getWeather(city) {
    const coords = await this.getCoordinates(city);
    const response = await fetch(baseURL);
    return weatherData;
}
```

### 5. **Validación de Formularios**
```javascript
// Validaciones personalizadas en cada módulo
- Nombre mínimo 3 caracteres
- Edad entre 3 y 18 años
- Formato de teléfono
- Rutas duplicadas
```

### 6. **Persistencia de Datos**
- Almacenamiento en localStorage
- Recuperación automática al recargar
- Cache de información del clima (1 hora)

### 7. **Diseño Responsive**
- **Desktop**: 300px sidebar + grid de 3 columnas
- **Tablet (≤768px)**: Layout en una columna
- **Mobile (≤480px)**: Elementos apilados
- **Muy pequeño (≤320px)**: Ajuste especial

### 8. **Accesibilidad**
- Respeta `prefers-reduced-motion`
- Soporte para modo oscuro
- Labels accesibles en formularios
- Semántica HTML correcta

---

## 🔧 Arquitectura del Código

### StudentManager (students.js)
```javascript
// Métodos principales
- createStudent(name, age, phone, routeId)
- assignStudentToRoute(studentId, routeId)
- getStudentsByRoute(routeId)
- getUnassignedStudents()
- deleteStudent(studentId)
- validateStudentData(name, age, phone)
```

### RouteManager (routes.js)
```javascript
// Métodos principales
- createRoute(name, driver, departureTime, city)
- getRouteById(routeId)
- deleteRoute(routeId)
- getStudentCountInRoute(routeId)
- validateRouteData(name, driver, departureTime, city)
```

### WeatherManager (weather.js)
```javascript
// Métodos principales
- getWeather(city)
- getCoordinates(city)
- getWeatherCondition(code)
- getWeatherEmoji(code)
- convertTemperature(celsius, unit)
```

### RouteCard Web Component (app.js)
```javascript
// Métodos principales
- render()
- loadWeather(city)
- setupListeners()
- showStudentsModal(routeId)
```

---

## 📊 Flujo de Datos

```
Interfaz (HTML)
    ↓
Formularios (eventos)
    ↓
Managers (StudentManager, RouteManager, WeatherManager)
    ↓
localStorage (persistencia)
    ↓
CustomEvents (actualizaciones)
    ↓
Renderización (app.js)
    ↓
Web Components (route-card)
```

---

## 🌐 API Utilizada

### Open-Meteo API
- **URL Base**: `https://api.open-meteo.com/v1/forecast`
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`
- **Ventaja**: Sin API key requerida
- **Límite**: 10,000 solicitudes/día

**Datos Obtenidos**:
- Temperatura actual
- Código de condición climática
- Velocidad del viento
- Coordenadas de la ciudad

**Códigos WMO** (World Meteorological Organization):
- 0-1: Despejado ☀️
- 2-3: Nublado ☁️
- 45-48: Niebla 🌫️
- 51-65: Lluvia 🌧️
- 71-86: Nieve ❄️
- 95-99: Tormenta ⛈️

---

## 💾 Estructura del localStorage

```javascript
// Rutas
localStorage.getItem('routes')
[
  {
    id: "route_1234567890_abc123",
    name: "Ruta Centro",
    driver: "Juan Pérez",
    departureTime: "08:00",
    city: "Madrid",
    status: "active",
    createdAt: "2026-05-23T10:30:00Z"
  }
]

// Estudiantes
localStorage.getItem('students')
[
  {
    id: "student_1234567890_xyz789",
    name: "María García",
    age: 10,
    phone: "+34 123456789",
    routeId: "route_1234567890_abc123",
    createdAt: "2026-05-23T10:35:00Z"
  }
]

// Cache del Clima
localStorage.getItem('weatherCache')
{
  "madrid": {
    data: { city: "Madrid", temperature: 22, ... },
    timestamp: 1716454200000
  }
}
```

---

## 🎨 Paleta de Colores

```css
--primary-color: #2563eb          /* Azul principal */
--primary-hover: #1d4ed8          /* Azul oscuro */
--secondary-color: #64748b        /* Gris */
--success-color: #10b981          /* Verde */
--danger-color: #ef4444           /* Rojo */
--warning-color: #f59e0b          /* Naranja */
--bg-primary: #ffffff             /* Fondo blanco */
--bg-secondary: #f8fafc           /* Fondo claro */
--text-primary: #1e293b           /* Texto oscuro */
--text-secondary: #64748b         /* Texto gris */
```

---

## 📱 Breakpoints Responsive

| Dispositivo | Ancho | Cambios |
|---|---|---|
| Desktop | >768px | Sidebar + 3 columnas |
| Tablet | 481-768px | Layout en 1 columna |
| Mobile | 321-480px | Botones a ancho completo |
| Extra Small | ≤320px | Ajustes especiales |

---

## 🐛 Solución de Problemas

### El clima no carga
**Causa**: Problema de conectividad o API no disponible
**Solución**: Verifica tu conexión a internet; la app continuará funcionando sin clima

### Los datos no persisten
**Causa**: localStorage deshabilitado o navegación privada
**Solución**: Usa navegación normal; habilita localStorage en configuración del navegador

### Web Component no se renderiza
**Causa**: Navegador antiguo sin soporte
**Solución**: Actualiza tu navegador a una versión moderna

### Estilos no aplican
**Causa**: Archivo CSS no cargado
**Solución**: Verifica que la ruta `Css/styles.css` sea correcta

---

## 📚 Recursos Educativos

### Conceptos Implementados

1. **DOM API**
   - `querySelector()`, `getElementById()`
   - `addEventListener()`, `removeEventListener()`
   - `createElement()`, `appendChild()`
   - `classList` y manipulación de atributos

2. **Web Components**
   - `customElements.define()`
   - `HTMLElement` y `connectedCallback()`
   - Shadow DOM y encapsulación
   - Templates y slots

3. **Asincronía**
   - `async/await`
   - `fetch()` API
   - Promesas
   - Error handling

4. **Eventos**
   - Eventos del DOM
   - `CustomEvent`
   - Bubbling y capturing
   - Event delegation

5. **Storage**
   - localStorage API
   - Serialización JSON
   - Persistencia de datos

---

## 📝 Commits Recomendados

```bash
# Inicial
git commit -m "feat: estructura base del proyecto"

# HTML y CSS
git commit -m "feat: agregar HTML y estilos responsive"

# Módulos
git commit -m "feat: crear módulos de rutas y estudiantes"
git commit -m "feat: integrar API de clima"

# App Principal
git commit -m "feat: crear Web Component route-card"
git commit -m "feat: completar lógica principal de la app"

# Documentación
git commit -m "docs: agregar README y documentación"
```

---

## 🔐 Notas de Seguridad

⚠️ **Importante**: Este es un proyecto educativo. En producción:
- Implementar validación en backend
- Usar HTTPS para API calls
- Proteger datos sensibles
- Implementar autenticación
- Usar tokens seguros

---

## 👨‍💻 Autor

Proyecto desarrollado como demostración de:
- Dominio de JavaScript Vanilla
- Buenas prácticas de código
- Arquitectura modular
- Componentes reutilizables
- Interfaz responsive

---

## 📄 Licencia

Este proyecto es de código abierto y puede ser utilizado libremente con fines educativos.

---

## 🚀 Próximas Mejoras

- [ ] Edición de rutas y estudiantes
- [ ] Búsqueda y filtrado avanzado
- [ ] Exportar datos a PDF
- [ ] Sincronización con backend
- [ ] Autenticación de usuarios
- [ ] Estadísticas y reportes
- [ ] Notificaciones en tiempo real
- [ ] Geolocaliazación en mapas

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisa este README
2. Inspecciona la consola del navegador (F12)
3. Verifica los datos en DevTools > Storage > Local Storage
4. Abre un issue en GitHub

---

**Última actualización**: 23 de Mayo de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Completo y funcional
