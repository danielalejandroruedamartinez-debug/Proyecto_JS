/**
 * MÓDULO DE ESTUDIANTES
 * Gestiona la creación, asignación y eliminación de estudiantes
 */

class StudentManager {
    constructor() {
        this.students = this.loadStudentsFromStorage();
    }

    /**
     * Carga estudiantes del localStorage
     */
    loadStudentsFromStorage() {
        const stored = localStorage.getItem('students');
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Guarda estudiantes en localStorage
     */
    saveStudentsToStorage() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    /**
     * Valida los datos de un estudiante
     */
    validateStudentData(name, age, phone, routeId) {
        const errors = [];

        if (!name || name.trim().length === 0) {
            errors.push('El nombre es requerido');
        }
        if (!name || name.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }
        if (!age || age < 3 || age > 18) {
            errors.push('La edad debe estar entre 3 y 18 años');
        }
        if (!phone || phone.trim().length === 0) {
            errors.push('El teléfono es requerido');
        }
        if (phone && !/^[\+\d\s\-\(\)]+$/.test(phone)) {
            errors.push('El formato del teléfono no es válido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Crea un nuevo estudiante
     */
    createStudent(name, age, phone, routeId = null) {
        const validation = this.validateStudentData(name, age, phone, routeId);
        
        if (!validation.isValid) {
            throw new Error(validation.errors.join('\n'));
        }

        const student = {
            id: 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            age: parseInt(age),
            phone: phone.trim(),
            routeId: routeId || null,
            createdAt: new Date().toISOString()
        };

        this.students.push(student);
        this.saveStudentsToStorage();
        
        // Dispara evento personalizado
        document.dispatchEvent(new CustomEvent('studentCreated', { detail: student }));
        
        return student;
    }

    /**
     * Asigna un estudiante a una ruta
     */
    assignStudentToRoute(studentId, routeId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) {
            throw new Error('Estudiante no encontrado');
        }

        student.routeId = routeId;
        this.saveStudentsToStorage();
        
        // Evento personalizado
        document.dispatchEvent(new CustomEvent('studentAssigned', { 
            detail: { studentId, routeId, student } 
        }));
        
        return student;
    }

    /**
     * Desasigna un estudiante de una ruta
     */
    unassignStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) {
            throw new Error('Estudiante no encontrado');
        }

        const previousRouteId = student.routeId;
        student.routeId = null;
        this.saveStudentsToStorage();
        
        document.dispatchEvent(new CustomEvent('studentUnassigned', { 
            detail: { studentId, previousRouteId } 
        }));
        
        return student;
    }

    /**
     * Obtiene todos los estudiantes
     */
    getAllStudents() {
        return [...this.students];
    }
    
    /**
     * Obtiene estudiantes de una ruta específica
     */
    getStudentsByRoute(routeId) {
        return this.students.filter(s => s.routeId === routeId);
    }

    /**
     * Obtiene estudiantes sin asignar
     */
    getUnassignedStudents() {
        return this.students.filter(s => !s.routeId);
    }

    /**
     * Obtiene un estudiante por ID
     */
    getStudentById(studentId) {
        return this.students.find(s => s.id === studentId);
    }

    /**
     * Elimina un estudiante
     */
    deleteStudent(studentId) {
        const index = this.students.findIndex(s => s.id === studentId);
        if (index === -1) {
            throw new Error('Estudiante no encontrado');
        }

        const student = this.students.splice(index, 1)[0];
        this.saveStudentsToStorage();
        
        document.dispatchEvent(new CustomEvent('studentDeleted', { 
            detail: { studentId, student } 
        }));
        
        return student;
    }

    /**
     * Actualiza los datos de un estudiante
     */
    updateStudent(studentId, updates) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) {
            throw new Error('Estudiante no encontrado');
        }

        // Valida si hay cambios en nombre, edad o teléfono
        if (updates.name || updates.age || updates.phone) {
            const validation = this.validateStudentData(
                updates.name || student.name,
                updates.age || student.age,
                updates.phone || student.phone,
                student.routeId
            );
            
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }
        }

        Object.assign(student, updates, { updatedAt: new Date().toISOString() });
        this.saveStudentsToStorage();
        
        document.dispatchEvent(new CustomEvent('studentUpdated', { 
            detail: { studentId, student } 
        }));
        
        return student;
    }

    /**
     * Limpia todos los estudiantes
     */
    clearAllStudents() {
        this.students = [];
        this.saveStudentsToStorage();
        document.dispatchEvent(new CustomEvent('studentsCleared'));
    }
}

// Instancia global del gestor de estudiantes
const studentManager = new StudentManager();
