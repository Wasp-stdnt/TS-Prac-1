// -----------------------------
// 1. Enum'и
// -----------------------------

/**
 * Статус студента в університеті.
 */
enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled",
}

/**
 * Тип курсу: обов'язковий, вибірковий, спеціальний.
 */
enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special",
}

/**
 * Семестр навчання.
 */
enum Semester {
    First = "First",
    Second = "Second",
}

/**
 * Оцінки за шкалою 2–5.
 */
enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2,
}

/**
 * Факультети університету.
 */
enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering",
}

// -----------------------------
// 2. Інтерфейси
// -----------------------------

interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

/**
 * Курс університету.
 */
interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

/**
 * Запис про оцінку студента.
 * (Назву інтерфейсу змінено з Grade на GradeRecord,
 *  щоб не конфліктувати з enum Grade.)
 */
interface GradeRecord {
    studentId: number;
    courseId: number;
    grade: Grade;
    date: Date;
    semester: Semester;
}

/**
 * Внутрішній тип для зв'язку "студент-курс" (реєстрація на курс).
 */
interface CourseRegistration {
    studentId: number;
    courseId: number;
}

// -----------------------------
// 3. Клас UniversityManagementSystem
// -----------------------------

class UniversityManagementSystem {
    // "База даних" у пам'яті
    private students: Student[] = [];
    private courses: Course[] = [];
    private registrations: CourseRegistration[] = [];
    private grades: GradeRecord[] = [];

    private nextStudentId: number = 1;

    /**
     * Додатково можна передати початкові курси / студентів (не обовʼязково).
     */
    constructor(initialCourses?: Course[], initialStudents?: Student[]) {
        if (Array.isArray(initialCourses)) {
            this.courses = [...initialCourses];
        }
        if (Array.isArray(initialStudents)) {
            this.students = [...initialStudents];
            // Якщо студентів передали з id, оновимо nextStudentId
            const maxId = this.students.reduce(
                (max: number, s: Student) => (s.id > max ? s.id : max),
                0
            );
            this.nextStudentId = maxId + 1;
        }
    }

    // -----------------------------
    // Сервісні приватні методи
    // -----------------------------

    private findStudentById(studentId: number): Student | undefined {
        return this.students.find((s: Student) => s.id === studentId);
    }

    private findCourseById(courseId: number): Course | undefined {
        return this.courses.find((c: Course) => c.id === courseId);
    }

    private isStudentRegisteredForCourse(
        studentId: number,
        courseId: number
    ): boolean {
        return this.registrations.some(
            (r: CourseRegistration) =>
                r.studentId === studentId && r.courseId === courseId
        );
    }

    private countStudentsOnCourse(courseId: number): number {
        return this.registrations.filter(
            (r: CourseRegistration) => r.courseId === courseId
        ).length;
    }

    // -----------------------------
    // Публічні методи API
    // -----------------------------

    /**
     * Реєстрація студента в університеті.
     * id генерується автоматично.
     */
    enrollStudent(student: Omit<Student, "id">): Student {
        const newStudent: Student = {
            ...student,
            id: this.nextStudentId++,
        };
        this.students.push(newStudent);
        return newStudent;
    }

    /**
     * Додати курс в систему (додатковий метод, корисний для демо / ініціалізації).
     */
    addCourse(course: Course): void {
        const exists: boolean = !!this.findCourseById(course.id);
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
    registerForCourse(studentId: number, courseId: number): void {
        const student: Student | undefined = this.findStudentById(studentId);
        const course: Course | undefined = this.findCourseById(courseId);

        if (!student) {
            throw new Error(`Student with id=${studentId} not found`);
        }
        if (!course) {
            throw new Error(`Course with id=${courseId} not found`);
        }

        if (student.status !== StudentStatus.Active) {
            throw new Error(
                `Student with id=${studentId} is not Active (current status: ${student.status})`
            );
        }

        if (student.faculty !== course.faculty) {
            throw new Error(
                `Student faculty (${student.faculty}) does not match course faculty (${course.faculty})`
            );
        }

        const currentCount: number = this.countStudentsOnCourse(courseId);
        if (currentCount >= course.maxStudents) {
            throw new Error(`Course with id=${courseId} is already full`);
        }

        if (this.isStudentRegisteredForCourse(studentId, courseId)) {
            throw new Error(
                `Student with id=${studentId} is already registered for course ${courseId}`
            );
        }

        this.registrations.push({ studentId, courseId });
    }

    /**
     * Виставлення оцінки студенту за курс.
     * Перевіряється:
     * - чи існують студент і курс
     * - чи був студент зареєстрований на курс
     */
    setGrade(studentId: number, courseId: number, grade: Grade): void {
        const student: Student | undefined = this.findStudentById(studentId);
        const course: Course | undefined = this.findCourseById(courseId);

        if (!student) {
            throw new Error(`Student with id=${studentId} not found`);
        }
        if (!course) {
            throw new Error(`Course with id=${courseId} not found`);
        }

        if (!this.isStudentRegisteredForCourse(studentId, courseId)) {
            throw new Error(
                `Cannot set grade: student ${studentId} is not registered for course ${courseId}`
            );
        }

        const record: GradeRecord = {
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
    updateStudentStatus(
        studentId: number,
        newStatus: StudentStatus
    ): void {
        const student: Student | undefined = this.findStudentById(studentId);

        if (!student) {
            throw new Error(`Student with id=${studentId} not found`);
        }

        const currentStatus: StudentStatus = student.status;

        // Забороняємо зміну статусу "назад" з Graduated/Expelled
        const isFinalStatus: boolean =
            currentStatus === StudentStatus.Graduated ||
            currentStatus === StudentStatus.Expelled;

        if (isFinalStatus && newStatus === StudentStatus.Active) {
            throw new Error(
                `Cannot change status from ${currentStatus} back to Active`
            );
        }

        // За бажанням можна додати ще більше правил
        student.status = newStatus;
    }

    /**
     * Повертає всіх студентів певного факультету.
     */
    getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(
            (s: Student) => s.faculty === faculty
        );
    }

    /**
     * Повертає всі оцінки конкретного студента.
     */
    getStudentGrades(studentId: number): GradeRecord[] {
        return this.grades.filter(
            (g: GradeRecord) => g.studentId === studentId
        );
    }

    /**
     * Повертає список доступних курсів для факультету та семестру.
     * Курс вважається доступним, якщо є вільні місця.
     */
    getAvailableCourses(
        faculty: Faculty,
        semester: Semester
    ): Course[] {
        return this.courses.filter((c: Course) => {
            const sameFaculty: boolean = c.faculty === faculty;
            const sameSemester: boolean = c.semester === semester;
            const currentCount: number = this.countStudentsOnCourse(c.id);
            const hasPlaces: boolean = currentCount < c.maxStudents;
            return sameFaculty && sameSemester && hasPlaces;
        });
    }

    /**
     * Обчислює середню оцінку студента по всіх курсах.
     * Якщо оцінок немає — повертає 0.
     */
    calculateAverageGrade(studentId: number): number {
        const studentGrades: GradeRecord[] = this.getStudentGrades(studentId);

        if (studentGrades.length === 0) {
            return 0;
        }

        const sum: number = studentGrades.reduce(
            (acc: number, record: GradeRecord) => acc + record.grade,
            0
        );

        const avg: number = sum / studentGrades.length;
        // Округлимо до двох знаків після коми
        return Math.round(avg * 100) / 100;
    }

    /**
     * Додатковий метод:
     * Повертає список "відмінників" по факультету.
     * Критерій: середня оцінка >= 4.5.
     */
    getHonorsStudentsByFaculty(faculty: Faculty): Student[] {
        const studentsOfFaculty: Student[] =
            this.getStudentsByFaculty(faculty);

        return studentsOfFaculty.filter((student: Student) => {
            const avg: number = this.calculateAverageGrade(student.id);
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
const csStudents = ums.getStudentsByFaculty(
    Faculty.Computer_Science
);
const s1Grades = ums.getStudentGrades(student1.id);
const s1Avg = ums.calculateAverageGrade(student1.id);
const csHonors = ums.getHonorsStudentsByFaculty(
    Faculty.Computer_Science
);
const availableCourses = ums.getAvailableCourses(
    Faculty.Computer_Science,
    Semester.First
);

console.log("Студенти CS:", csStudents);
console.log("Оцінки студента 1:", s1Grades);
console.log("Середній бал студента 1:", s1Avg);
console.log("Відмінники CS:", csHonors);
console.log("Доступні курси CS (1 семестр):", availableCourses);
