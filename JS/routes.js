/**
 * MÓDULO DE RUTAS
 * Gestiona la creación, actualización y eliminación de rutas escolares
 */

class RouteManager {
    constructor() {
        this.routes = this.loadRoutesFromStorage();
    }

    /**
     * Carga rutas del localStorage
     */
    loadRoutesFromStorage() {
        const stored = localStorage.getItem('routes');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Guarda rutas en localStorage
     */
    saveRoutesToStorage() {
        localStorage.setItem('routes', JSON.stringify(this.routes));
    }

    /**
     * Valida los datos de una ruta
     */
    validateRouteData(name, driver, departureTime, city) {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push('El nombre de la ruta es requerido');
        }
        if (!name || name.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }
        if (!driver || driver.trim().length === 0) {
            errors.push('El nombre del conductor es requerido');
        }
        if (!driver || driver.trim().length < 3) {
            errors.push('El nombre del conductor debe tener al menos 3 caracteres');
        }
        if (!departureTime || !/^\d{2}:\d{2}$/.test(departureTime)) {
            errors.push('La hora de salida debe estar en formato HH:MM');
        }
        if (!city || city.trim().length === 0) {
            errors.push('La ciudad es requerida');
        }

        // Verifica que no exista otra ruta con el mismo nombre
        if (name && this.routes.some(r => r.name.toLowerCase() === name.trim().toLowerCase())) {
            errors.push('Ya existe una ruta con este nombre');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Crea una nueva ruta
     */
    createRoute(name, driver, departureTime, city) {
        const validation = this.validateRouteData(name, driver, departureTime, city);
        
        if (!validation.isValid) {
            throw new Error(validation.errors.join('\n'));
        }

        const route = {
            id: 'route_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            driver: driver.trim(),
            departureTime: departureTime,
            city: city.trim(),
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        this.routes.push(route);
        this.saveRoutesToStorage();
        
        // Dispara evento personalizado
        document.dispatchEvent(new CustomEvent('routeCreated', { detail: route }));
        
        return route;
    }

    /**
     * Obtiene todas las rutas
     */
    getAllRoutes() {
        return [...this.routes];
    }

    /**
     * Obtiene una ruta por ID
     */
    getRouteById(routeId) {
        return this.routes.find(r => r.id === routeId);
    }

    /**
     * Actualiza una ruta
     */
    updateRoute(routeId, updates) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) {
            throw new Error('Ruta no encontrada');
        }

        // Valida si hay cambios en datos sensibles
        if (updates.name || updates.driver || updates.departureTime || updates.city) {
            const validation = this.validateRouteData(
                updates.name || route.name,
                updates.driver || route.driver,
                updates.departureTime || route.departureTime,
                updates.city || route.city
            );
            
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }
        }

        Object.assign(route, updates, { updatedAt: new Date().toISOString() });
        this.saveRoutesToStorage();
        
        document.dispatchEvent(new CustomEvent('routeUpdated', { 
            detail: { routeId, route } 
        }));
        
        return route;
    }

    /**
     * Elimina una ruta
     */
    deleteRoute(routeId) {
        const index = this.routes.findIndex(r => r.id === routeId);
        if (index === -1) {
            throw new Error('Ruta no encontrada');
        }

        const route = this.routes.splice(index, 1)[0];
        this.saveRoutesToStorage();
        
        // Desasigna todos los estudiantes de la ruta
        if (window.studentManager) {
            const students = window.studentManager.getStudentsByRoute(routeId);
            students.forEach(student => {
                window.studentManager.unassignStudent(student.id);
            });
        }
        
        document.dispatchEvent(new CustomEvent('routeDeleted', { 
            detail: { routeId, route } 
        }));
        
        return route;
    }

    /**
     * Cuenta el número de estudiantes en una ruta
     */
    getStudentCountInRoute(routeId) {
        if (!window.studentManager) return 0;
        return window.studentManager.getStudentsByRoute(routeId).length;
    }

    /**
     * Cambia el estado de una ruta
     */
    changeRouteStatus(routeId, status) {
        const route = this.routes.find(r => r.id === routeId);
        if (!route) {
            throw new Error('Ruta no encontrada');
        }

        route.status = status;
        this.saveRoutesToStorage();
        
        document.dispatchEvent(new CustomEvent('routeStatusChanged', { 
            detail: { routeId, status, route } 
        }));
        
        return route;
    }

    /**
     * Obtiene rutas activas
     */
    getActiveRoutes() {
        return this.routes.filter(r => r.status === 'active');
    }

    /**
     * Obtiene rutas inactivas
     */
    getInactiveRoutes() {
        return this.routes.filter(r => r.status !== 'active');
    }

    /**
     * Limpia todas las rutas
     */
    clearAllRoutes() {
        this.routes = [];
        this.saveRoutesToStorage();
        document.dispatchEvent(new CustomEvent('routesCleared'));
    }
}

// Instancia global del gestor de rutas
const routeManager = new RouteManager();
