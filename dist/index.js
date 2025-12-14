"use strict";
// -----------------------------
// 1. Enum'и
// -----------------------------
/**
 * Статус студента в університеті.
 */
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["Active"] = "Active";
    StudentStatus["Academic_Leave"] = "Academic_Leave";
    StudentStatus["Graduated"] = "Graduated";
    StudentStatus["Expelled"] = "Expelled";
})(StudentStatus || (StudentStatus = {}));
/**
 * Тип курсу: обов'язковий, вибірковий, спеціальний.
 */
var CourseType;
(function (CourseType) {
    CourseType["Mandatory"] = "Mandatory";
    CourseType["Optional"] = "Optional";
    CourseType["Special"] = "Special";
})(CourseType || (CourseType = {}));
/**
 * Семестр навчання.
 */
var Semester;
(function (Semester) {
    Semester["First"] = "First";
    Semester["Second"] = "Second";
})(Semester || (Semester = {}));
/**
 * Оцінки за шкалою 2–5.
 */
var Grade;
(function (Grade) {
    Grade[Grade["Excellent"] = 5] = "Excellent";
    Grade[Grade["Good"] = 4] = "Good";
    Grade[Grade["Satisfactory"] = 3] = "Satisfactory";
    Grade[Grade["Unsatisfactory"] = 2] = "Unsatisfactory";
})(Grade || (Grade = {}));
/**
 * Факультети університету.
 */
var Faculty;
(function (Faculty) {
    Faculty["Computer_Science"] = "Computer_Science";
    Faculty["Economics"] = "Economics";
    Faculty["Law"] = "Law";
    Faculty["Engineering"] = "Engineering";
})(Faculty || (Faculty = {}));
// -----------------------------
// 3. Клас UniversityManagementSystem
// -----------------------------
class UniversityManagementSystem {
    /**
     * Додатково можна передати початкові курси / студентів (не обовʼязково).
     */
    constructor(initialCourses, initialStudents) {
        // "База даних" у пам'яті
        this.students = [];
        this.courses = [];
        this.registrations = [];
        this.grades = [];
        this.nextStudentId = 1;
        if (Array.isArray(initialCourses)) {
            this.courses = [...initialCourses];
        }
        if (Array.isArray(initialStudents)) {
            this.students = [...initialStudents];
            // Якщо студентів передали з id, оновимо nextStudentId
            const maxId = this.students.reduce((max, s) => (s.id > max ? s.id : max), 0);
            this.nextStudentId = maxId + 1;
        }
    }
    // -----------------------------
    // Сервісні приватні методи
    // -----------------------------
    findStudentById(studentId) {
        return this.students.find((s) => s.id === studentId);
    }
    findCourseById(courseId) {
        return this.courses.find((c) => c.id === courseId);
    }
    isStudentRegisteredForCourse(studentId, courseId) {
        return this.registrations.some((r) => r.studentId === studentId && r.courseId === courseId);
    }
    countStudentsOnCourse(courseId) {
        return this.registrations.filter((r) => r.courseId === courseId).length;
    }
    // -----------------------------
    // Публічні методи API
    // -----------------------------
    /**
     * Реєстрація студента в університеті.
     * id генерується автоматично.
     */
    enrollStudent(student) {
        const newStudent = Object.assign(Object.assign({}, student), { id: this.nextStudentId++ });
        this.students.push(newStudent);
        return newStudent;
    }
    /**
     * Додати курс в систему (додатковий метод, корисний для демо / ініціалізації).
     */
    addCourse(course) {
        const exists = !!this.findCourseById(course.id);
        if (exists) {
            throw new Error(`Course with id=${course.id} already exists`);
        }
        this.courses.push(course);
    }
    /**
     * Реєстрація студента на курс.
     * Перевіряється:
     * - чи існують студент і курс
     * - статус студента (тільки Active)
     * - відповідність факультету
     * - чи не перевищено maxStudents
     * - чи не зареєстрований уже на цей курс
     */
    registerForCourse(studentId, courseId) {
        const student = this.findStudentById(studentId);
        const course = this.findCourseById(courseId);
        if (!student) {
            throw new Error(`Student with id=${studentId} not found`);
        }
        if (!course) {
            throw new Error(`Course with id=${courseId} not found`);
        }
        if (student.status !== StudentStatus.Active) {
            throw new Error(`Student with id=${studentId} is not Active (current status: ${student.status})`);
        }
        if (student.faculty !== course.faculty) {
            throw new Error(`Student faculty (${student.faculty}) does not match course faculty (${course.faculty})`);
        }
        const currentCount = this.countStudentsOnCourse(courseId);
        if (currentCount >= course.maxStudents) {
            throw new Error(`Course with id=${courseId} is already full`);
        }
        if (this.isStudentRegisteredForCourse(studentId, courseId)) {
            throw new Error(`Student with id=${studentId} is already registered for course ${courseId}`);
        }
        this.registrations.push({ studentId, courseId });
    }
    /**
     * Виставлення оцінки студенту за курс.
     * Перевіряється:
     * - чи існують студент і курс
     * - чи був студент зареєстрований на курс
     */
    setGrade(studentId, courseId, grade) {
        const student = this.findStudentById(studentId);
        const course = this.findCourseById(courseId);
        if (!student) {
            throw new Error(`Student with id=${studentId} not found`);
        }
        if (!course) {
            throw new Error(`Course with id=${courseId} not found`);
        }
        if (!this.isStudentRegisteredForCourse(studentId, courseId)) {
            throw new Error(`Cannot set grade: student ${studentId} is not registered for course ${courseId}`);
        }
        const record = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester,
        };
        this.grades.push(record);
    }
    /**
     * Оновлення статусу студента.
     * Просте правило валідації:
     * - З Graduated або Expelled повернутися в Active не можна.
     * - Між Active та Academic_Leave можна переключатися.
     */
    updateStudentStatus(studentId, newStatus) {
        const student = this.findStudentById(studentId);
        if (!student) {
            throw new Error(`Student with id=${studentId} not found`);
        }
        const currentStatus = student.status;
        // Забороняємо зміну статусу "назад" з Graduated/Expelled
        const isFinalStatus = currentStatus === StudentStatus.Graduated ||
            currentStatus === StudentStatus.Expelled;
        if (isFinalStatus && newStatus === StudentStatus.Active) {
            throw new Error(`Cannot change status from ${currentStatus} back to Active`);
        }
        // За бажанням можна додати ще більше правил
        student.status = newStatus;
    }
    /**
     * Повертає всіх студентів певного факультету.
     */
    getStudentsByFaculty(faculty) {
        return this.students.filter((s) => s.faculty === faculty);
    }
    /**
     * Повертає всі оцінки конкретного студента.
     */
    getStudentGrades(studentId) {
        return this.grades.filter((g) => g.studentId === studentId);
    }
    /**
     * Повертає список доступних курсів для факультету та семестру.
     * Курс вважається доступним, якщо є вільні місця.
     */
    getAvailableCourses(faculty, semester) {
        return this.courses.filter((c) => {
            const sameFaculty = c.faculty === faculty;
            const sameSemester = c.semester === semester;
            const currentCount = this.countStudentsOnCourse(c.id);
            const hasPlaces = currentCount < c.maxStudents;
            return sameFaculty && sameSemester && hasPlaces;
        });
    }
    /**
     * Обчислює середню оцінку студента по всіх курсах.
     * Якщо оцінок немає — повертає 0.
     */
    calculateAverageGrade(studentId) {
        const studentGrades = this.getStudentGrades(studentId);
        if (studentGrades.length === 0) {
            return 0;
        }
        const sum = studentGrades.reduce((acc, record) => acc + record.grade, 0);
        const avg = sum / studentGrades.length;
        // Округлимо до двох знаків після коми
        return Math.round(avg * 100) / 100;
    }
    /**
     * Додатковий метод:
     * Повертає список "відмінників" по факультету.
     * Критерій: середня оцінка >= 4.5.
     */
    getHonorsStudentsByFaculty(faculty) {
        const studentsOfFaculty = this.getStudentsByFaculty(faculty);
        return studentsOfFaculty.filter((student) => {
            const avg = this.calculateAverageGrade(student.id);
            return avg >= 4.5;
        });
    }
}
// -----------------------------
// 4. Невелике демо використання (можна залишити або закоментувати)
// -----------------------------
// Створюємо систему
const ums = new UniversityManagementSystem();
// Додаємо кілька курсів
ums.addCourse({
    id: 1,
    name: "Основи програмування",
    type: CourseType.Mandatory,
    credits: 5,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 2,
});
ums.addCourse({
    id: 2,
    name: "Алгоритми та структури даних",
    type: CourseType.Mandatory,
    credits: 6,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 3,
});
// Реєструємо студентів
const student1 = ums.enrollStudent({
    fullName: "Іван Іванов",
    faculty: Faculty.Computer_Science,
    year: 1,
    status: StudentStatus.Active,
    enrollmentDate: new Date("2024-09-01"),
    groupNumber: "CS-11",
});
const student2 = ums.enrollStudent({
    fullName: "Олена Петренко",
    faculty: Faculty.Computer_Science,
    year: 1,
    status: StudentStatus.Active,
    enrollmentDate: new Date("2024-09-01"),
    groupNumber: "CS-11",
});
// Реєстрація на курси
ums.registerForCourse(student1.id, 1);
ums.registerForCourse(student1.id, 2);
ums.registerForCourse(student2.id, 1);
// Виставляємо оцінки
ums.setGrade(student1.id, 1, Grade.Excellent);
ums.setGrade(student1.id, 2, Grade.Good);
ums.setGrade(student2.id, 1, Grade.Excellent);
// Приклад використання методів
const csStudents = ums.getStudentsByFaculty(Faculty.Computer_Science);
const s1Grades = ums.getStudentGrades(student1.id);
const s1Avg = ums.calculateAverageGrade(student1.id);
const csHonors = ums.getHonorsStudentsByFaculty(Faculty.Computer_Science);
const availableCourses = ums.getAvailableCourses(Faculty.Computer_Science, Semester.First);
console.log("Студенти CS:", csStudents);
console.log("Оцінки студента 1:", s1Grades);
console.log("Середній бал студента 1:", s1Avg);
console.log("Відмінники CS:", csHonors);
console.log("Доступні курси CS (1 семестр):", availableCourses);
