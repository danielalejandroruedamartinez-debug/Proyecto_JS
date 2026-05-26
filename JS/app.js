/**
 * APLICACIÓN PRINCIPAL
 * Orquesta todos los módulos y gestiona la interfaz
 */

// ==================== WEB COMPONENT: Route Card ====================
class RouteCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupListeners();
    }

    render() {
        const template = document.getElementById('routeCardTemplate');
        const clone = template.content.cloneNode(true);

        // Obtiene los datos de la ruta
        const routeId = this.getAttribute('route-id');
        const route = routeManager.getRouteById(routeId);

        if (!route) return;

        // Actualiza los elementos del template
        clone.querySelector('.route-title').textContent = route.name;
        clone.querySelector('.driver-name').textContent = route.driver;
        clone.querySelector('.departure-time').textContent = route.departureTime;

        // Cuenta de estudiantes
        const studentCount = studentManager.getStudentsByRoute(routeId).length;
        clone.querySelector('.student-count').textContent = studentCount;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(clone);

        // Carga el clima
        this.loadWeather(route.city);
    }

    async loadWeather(city) {
        try {
            const weather = await weatherManager.getWeather(city);
            const weatherInfo = this.shadowRoot.querySelector('.weather-info');
            if (weatherInfo) {
                weatherInfo.textContent = `${weather.emoji} ${weather.temperature}°C`;
                weatherInfo.title = `${weather.condition} - Viento: ${weather.windSpeed} km/h`;
            }
        } catch (error) {
            const weatherInfo = this.shadowRoot.querySelector('.weather-info');
            if (weatherInfo) {
                weatherInfo.textContent = '⚠️';
                weatherInfo.title = 'No se pudo cargar el clima';
            }
        }
    }

    setupListeners() {
        const routeId = this.getAttribute('route-id');

        // Botón para ver estudiantes
        const viewBtn = this.shadowRoot.querySelector('.view-students');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                this.showStudentsModal(routeId);
            });
        }

        // Botón para eliminar ruta
        const deleteBtn = this.shadowRoot.querySelector('.delete-route');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('¿Está seguro que desea eliminar esta ruta?')) {
                    try {
                        routeManager.deleteRoute(routeId);
                        showNotification('Ruta eliminada correctamente', 'success');
                        renderRoutes();
                        updateStudentRouteSelect();
                    } catch (error) {
                        showNotification(error.message, 'error');
                    }
                }
            });
        }
    }

    showStudentsModal(routeId) {
        const route = routeManager.getRouteById(routeId);
        const students = studentManager.getStudentsByRoute(routeId);

        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Estudiantes - Ruta: ${route.name}`;

        if (students.length === 0) {
            modalBody.innerHTML = '<p style="text-align: center; color: #94a3b8;">No hay estudiantes asignados a esta ruta</p>';
        } else {
            let html = '<div style="overflow-x: auto;">';
            html += '<table style="width: 100%; border-collapse: collapse;">';
            html += '<thead><tr style="background-color: #f1f5f9; border-bottom: 2px solid #e2e8f0;">';
            html += '<th style="padding: 12px; text-align: left;">Nombre</th>';
            html += '<th style="padding: 12px; text-align: left;">Edad</th>';
            html += '<th style="padding: 12px; text-align: left;">Teléfono</th>';
            html += '<th style="padding: 12px; text-align: center;">Acciones</th>';
            html += '</tr></thead>';
            html += '<tbody>';

            students.forEach(student => {
                html += `<tr style="border-bottom: 1px solid #e2e8f0;">`;
                html += `<td style="padding: 12px;">${student.name}</td>`;
                html += `<td style="padding: 12px;">${student.age} años</td>`;
                html += `<td style="padding: 12px;">${student.phone}</td>`;
                html += `<td style="padding: 12px; text-align: center;">`;
                html += `<button class="btn btn-danger btn-small" onclick="removeStudentFromRoute('${student.id}')">Remover</button>`;
                html += `</td>`;
                html += `</tr>`;
            });

            html += '</tbody></table></div>';
            modalBody.innerHTML = html;
        }

        modal.classList.add('active');
    }

    updateData() {
        this.render();
    }
}

// Registra el Web Component
customElements.define('route-card', RouteCard);

// ==================== Utilidades ====================

/**
 * Muestra notificaciones
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Actualiza el select de rutas
 */
function updateStudentRouteSelect() {
    const select = document.getElementById('assignRoute');
    const routes = routeManager.getAllRoutes();

    select.innerHTML = '<option value="">-- Selecciona una ruta --</option>';
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = `${route.name} (Conductor: ${route.driver})`;
        select.appendChild(option);
    });
}

/**
 * Renderiza todas las rutas
 */
function renderRoutes() {
    const container = document.getElementById('routesGrid');
    const routes = routeManager.getAllRoutes();

    container.innerHTML = '';

    if (routes.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #94a3b8;">No hay rutas creadas. ¡Crea tu primera ruta!</div>';
        return;
    }

    routes.forEach(route => {
        const routeCard = document.createElement('route-card');
        routeCard.setAttribute('route-id', route.id);
        container.appendChild(routeCard);
    });
}

/**
 * Renderiza todos los estudiantes
 */
function renderStudentList() {
    const container = document.getElementById('studentList');
    const students = studentManager.getAllStudents();

    container.innerHTML = '';

    if (students.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 2rem;">No hay estudiantes registrados. Agrega tu primer estudiante.</p>';
        return;
    }

    students.forEach(student => {
        const route = student.routeId ? routeManager.getRouteById(student.routeId) : null;
        const div = document.createElement('div');
        div.className = 'student-item';
        div.innerHTML = `
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-details">
                    Edad: ${student.age} | Teléfono: ${student.phone} | Ruta: ${route ? route.name : 'Sin ruta'}
                </div>
            </div>
            <div class="student-actions">
                <button class="btn btn-secondary btn-small" onclick="openEditStudentModal('${student.id}')">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteStudent('${student.id}')">Eliminar</button>
            </div>
        `;
        container.appendChild(div);
    });
}

/**
 * Abre modal para editar un estudiante
 */
function openEditStudentModal(studentId) {
    const student = studentManager.getStudentById(studentId);
    const routes = routeManager.getAllRoutes();
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `Editar estudiante: ${student.name}`;

    let html = '<form id="editStudentForm" class="form" style="display: grid; gap: 1rem;">';
    html += '<div class="form-group"><label>Nombre:</label><input type="text" id="editStudentName" value="' + student.name + '" required></div>';
    html += '<div class="form-group"><label>Edad:</label><input type="number" id="editStudentAge" min="3" max="18" value="' + student.age + '" required></div>';
    html += '<div class="form-group"><label>Teléfono:</label><input type="tel" id="editStudentPhone" value="' + student.phone + '" required></div>';
    html += '<div class="form-group"><label>Ruta asignada:</label><select id="editStudentRoute"><option value="">Sin ruta</option>';

    routes.forEach(route => {
        const selected = student.routeId === route.id ? 'selected' : '';
        html += `<option value="${route.id}" ${selected}>${route.name} (${route.driver})</option>`;
    });

    html += '</select></div>';
    html += '<div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">';
    html += '<button type="submit" class="btn btn-primary btn-small">Guardar cambios</button>';
    html += '<button type="button" class="btn btn-secondary btn-small" onclick="document.getElementById(\'modal\').classList.remove(\'active\')">Cancelar</button>';
    html += '</div>';
    html += '</form>';

    modalBody.innerHTML = html;
    modal.classList.add('active');

    document.getElementById('editStudentForm').addEventListener('submit', (event) => {
        event.preventDefault();
        updateStudentFromModal(studentId);
    });
}

/**
 * Actualiza un estudiante desde el modal
 */
function updateStudentFromModal(studentId) {
    const name = document.getElementById('editStudentName').value;
    const age = document.getElementById('editStudentAge').value;
    const phone = document.getElementById('editStudentPhone').value;
    const routeId = document.getElementById('editStudentRoute').value || null;

    try {
        studentManager.updateStudent(studentId, {
            name: name.trim(),
            age: parseInt(age, 10),
            phone: phone.trim(),
            routeId: routeId
        });
        document.getElementById('modal').classList.remove('active');
        showNotification('Estudiante actualizado correctamente', 'success');
        renderStudentList();
        renderRoutes();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Abre modal para asignar ruta a un estudiante
 */
function openAssignModal(studentId) {
    const student = studentManager.getStudentById(studentId);
    const routes = routeManager.getAllRoutes();

    if (routes.length === 0) {
        showNotification('No hay rutas disponibles. Crea una ruta primero.', 'warning');
        return;
    }

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `Asignar Ruta a: ${student.name}`;

    let html = '<div style="display: grid; gap: 0.75rem;">';
    routes.forEach(route => {
        const studentCount = studentManager.getStudentsByRoute(route.id).length;
        html += `<button class="btn btn-secondary" style="text-align: left;" onclick="assignStudentToRoute('${studentId}', '${route.id}')">`;
        html += `<strong>${route.name}</strong><br>`;
        html += `Conductor: ${route.driver} | Salida: ${route.departureTime} | Estudiantes: ${studentCount}`;
        html += `</button>`;
    });
    html += '</div>';

    modalBody.innerHTML = html;
    modal.classList.add('active');
}

/**
 * Asigna un estudiante a una ruta
 */
function assignStudentToRoute(studentId, routeId) {
    try {
        studentManager.assignStudentToRoute(studentId, routeId);
        document.getElementById('modal').classList.remove('active');
        showNotification('Estudiante asignado correctamente', 'success');
        renderStudentList();
        renderRoutes();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Remueve un estudiante de una ruta
 */
function removeStudentFromRoute(studentId) {
    if (confirm('¿Desasignar este estudiante de la ruta?')) {
        try {
            studentManager.unassignStudent(studentId);
            document.getElementById('modal').classList.remove('active');
            showNotification('Estudiante desasignado', 'success');
            renderStudentList();
            renderRoutes();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

/**
 * Elimina un estudiante
 */
function deleteStudent(studentId) {
    if (confirm('¿Está seguro que desea eliminar este estudiante?')) {
        try {
            studentManager.deleteStudent(studentId);
            showNotification('Estudiante eliminado correctamente', 'success');
            renderStudentList();
            renderRoutes();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

// ==================== Manejadores de Formularios ====================

/**
 * Maneja el formulario de crear rutas
 */
function setupRouteForm() {
    const form = document.getElementById('routeForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('routeName').value;
        const driver = document.getElementById('driverName').value;
        const departureTime = document.getElementById('departureTime').value;
        const city = document.getElementById('city').value;

        try {
            routeManager.createRoute(name, driver, departureTime, city);
            form.reset();
            showNotification('Ruta creada correctamente', 'success');
            renderRoutes();
            updateStudentRouteSelect();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

/**
 * Maneja el formulario de crear estudiantes
 */
function setupStudentForm() {
    const form = document.getElementById('studentForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('studentName').value;
        const age = document.getElementById('studentAge').value;
        const phone = document.getElementById('studentPhone').value;
        const routeId = document.getElementById('assignRoute').value || null;

        try {
            studentManager.createStudent(name, age, phone, routeId);
            form.reset();
            showNotification('Estudiante agregado correctamente', 'success');
            renderStudentList();
            renderRoutes();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

/**
 * Configura el modal
 */
function setupModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-modal');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ==================== Inicialización ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicación Rutas Seguras Kids - Iniciando...');

    // Configura formularios
    setupRouteForm();
    setupStudentForm();
    setupModal();

    // Renderiza datos existentes
    renderRoutes();
    renderStudentList();
    updateStudentRouteSelect();

    // Escucha eventos personalizados
    document.addEventListener('routeCreated', () => {
        renderRoutes();
        updateStudentRouteSelect();
    });

    document.addEventListener('routeDeleted', () => {
        renderRoutes();
        renderStudentList();
    });

    document.addEventListener('studentCreated', () => {
        renderStudentList();
        renderRoutes();
    });

    document.addEventListener('studentAssigned', () => {
        renderStudentList();
        renderRoutes();
    });

    document.addEventListener('studentUnassigned', () => {
        renderStudentList();
        renderRoutes();
    });

    document.addEventListener('studentDeleted', () => {
        renderStudentList();
        renderRoutes();
    });

    console.log('✓ Aplicación lista');
});

// ==================== Manejadores Globales ====================

window.removeStudentFromRoute = removeStudentFromRoute;
window.deleteStudent = deleteStudent;
window.openAssignModal = openAssignModal;
window.assignStudentToRoute = assignStudentToRoute;
