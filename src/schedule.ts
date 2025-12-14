// -----------------------------
// 1. Базові union та type aliases
// -----------------------------

export type DayOfWeek =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday";

export type TimeSlot =
    | "8:30-10:00"
    | "10:15-11:45"
    | "12:15-13:45"
    | "14:00-15:30"
    | "15:45-17:15";

export type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

// Допоміжні константи для аналізу (використовуються у getClassroomUtilization)
const ALL_DAYS: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];

const ALL_SLOTS: TimeSlot[] = [
    "8:30-10:00",
    "10:15-11:45",
    "12:15-13:45",
    "14:00-15:30",
    "15:45-17:15",
];

// -----------------------------
// 2. Основні структури
// -----------------------------

export type Professor = {
    id: number;
    name: string;
    department: string;
};

export type Classroom = {
    number: string;
    capacity: number;
    hasProjector: boolean;
};

export type Course = {
    id: number;
    name: string;
    type: CourseType;
};

/**
 * У завданні поле id не вказане, але далі є функції reassignClassroom(lessonId)
 * та cancelLesson(lessonId), тому додаємо id для однозначної ідентифікації заняття.
 */
export type Lesson = {
    id: number;
    courseId: number;
    professorId: number;
    classroomNumber: string;
    dayOfWeek: DayOfWeek;
    timeSlot: TimeSlot;
};

// -----------------------------
// 3. Масиви даних (умовна "база")
// -----------------------------

export const professors: Professor[] = [];
export const classrooms: Classroom[] = [];
export const courses: Course[] = [];
export const schedule: Lesson[] = [];

// -----------------------------
// 4. Додавання даних
// -----------------------------

/**
 * Додає нового професора, якщо ще немає професора з таким id.
 */
export function addProfessor(professor: Professor): void {
    const exists: boolean = professors.some(
        (p: Professor): boolean => p.id === professor.id
    );

    if (exists) {
        console.warn(`Professor with id=${professor.id} already exists.`);
        return;
    }

    professors.push(professor);
}

/**
 * Type для опису конфлікту в розкладі.
 */
export type ScheduleConflict = {
    type: "ProfessorConflict" | "ClassroomConflict";
    lessonDetails: Lesson;
};

/**
 * Перевіряє, чи створює нове заняття конфлікт у розкладі:
 * - той самий викладач, той самий день і слот
 * - та сама аудиторія, той самий день і слот
 */
export function validateLesson(lesson: Lesson): ScheduleConflict | null {
    for (const existing of schedule) {
        const sameTimeAndDay: boolean =
            existing.dayOfWeek === lesson.dayOfWeek &&
            existing.timeSlot === lesson.timeSlot;

        if (!sameTimeAndDay) {
            continue;
        }

        // Конфлікт викладача
        if (existing.professorId === lesson.professorId) {
            return {
                type: "ProfessorConflict",
                lessonDetails: existing,
            };
        }

        // Конфлікт аудиторії
        if (existing.classroomNumber === lesson.classroomNumber) {
            return {
                type: "ClassroomConflict",
                lessonDetails: existing,
            };
        }
    }

    return null;
}

/**
 * Додає заняття у розклад, якщо немає конфліктів.
 * Повертає true, якщо додали, і false, якщо є конфлікт.
 */
export function addLesson(lesson: Lesson): boolean {
    const conflict: ScheduleConflict | null = validateLesson(lesson);

    if (conflict !== null) {
        console.warn("Lesson conflict:", conflict.type, conflict.lessonDetails);
        return false;
    }

    schedule.push(lesson);
    return true;
}

// -----------------------------
// 5. Пошук та фільтрація
// -----------------------------

/**
 * Повертає номери вільних аудиторій у вказаний день і слот.
 */
export function findAvailableClassrooms(
    timeSlot: TimeSlot,
    dayOfWeek: DayOfWeek
): string[] {
    const occupiedNumbers: string[] = schedule
        .filter(
            (lesson: Lesson): boolean =>
                lesson.dayOfWeek === dayOfWeek && lesson.timeSlot === timeSlot
        )
        .map((lesson: Lesson): string => lesson.classroomNumber);

    const available: string[] = classrooms
        .filter(
            (room: Classroom): boolean => !occupiedNumbers.includes(room.number)
        )
        .map((room: Classroom): string => room.number);

    return available;
}

/**
 * Повертає розклад конкретного викладача.
 */
export function getProfessorSchedule(professorId: number): Lesson[] {
    return schedule.filter(
        (lesson: Lesson): boolean => lesson.professorId === professorId
    );
}

// -----------------------------
// 6. Аналіз та звіти
// -----------------------------

/**
 * Повертає відсоток використання аудиторії.
 * Логіка:
 *   - максимальна кількість слотів = всі дні * всі часові слоти
 *   - фактична кількість = кількість занять у цій аудиторії
 */
export function getClassroomUtilization(classroomNumber: string): number {
    const totalSlots: number = ALL_DAYS.length * ALL_SLOTS.length;

    if (totalSlots === 0) {
        return 0;
    }

    const usedSlots: number = schedule.filter(
        (lesson: Lesson): boolean => lesson.classroomNumber === classroomNumber
    ).length;

    const utilization: number = (usedSlots / totalSlots) * 100;
    // Округлимо до одного знаку після коми
    return Math.round(utilization * 10) / 10;
}

/**
 * Визначає найбільш популярний тип занять за кількістю Lesson.
 */
export function getMostPopularCourseType(): CourseType {
    if (schedule.length === 0) {
        // Базова обробка випадку без занять
        console.warn("Schedule is empty. Returning default course type 'Lecture'.");
        return "Lecture";
    }

    // Лічильник для кожного типу
    const counts: { Lecture: number; Seminar: number; Lab: number; Practice: number } =
        {
            Lecture: 0,
            Seminar: 0,
            Lab: 0,
            Practice: 0,
        };

    for (const lesson of schedule) {
        const course: Course | undefined = courses.find(
            (c: Course): boolean => c.id === lesson.courseId
        );

        // Якщо не знайшли курс — пропускаємо, щоб не ламати статистику
        if (!course) {
            continue;
        }

        counts[course.type] = counts[course.type] + 1;
    }

    // Визначаємо максимальний тип
    let mostPopular: CourseType = "Lecture";
    let maxCount: number = counts["Lecture"];

    (["Seminar", "Lab", "Practice"] as CourseType[]).forEach(
        (type: CourseType): void => {
            const value: number = counts[type];
            if (value > maxCount) {
                maxCount = value;
                mostPopular = type;
            }
        }
    );

    return mostPopular;
}

// -----------------------------
// 7. Модифікація даних
// -----------------------------

/**
 * Змінює аудиторію для заняття, якщо:
 *  - таке заняття існує
 *  - нова аудиторія існує
 *  - в новій аудиторії немає конфлікту в цей час
 */
export function reassignClassroom(
    lessonId: number,
    newClassroomNumber: string
): boolean {
    const lessonIndex: number = schedule.findIndex(
        (lesson: Lesson): boolean => lesson.id === lessonId
    );

    if (lessonIndex === -1) {
        console.warn(`Lesson with id=${lessonId} not found.`);
        return false;
    }

    const classroomExists: boolean = classrooms.some(
        (room: Classroom): boolean => room.number === newClassroomNumber
    );

    if (!classroomExists) {
        console.warn(
            `Classroom with number=${newClassroomNumber} does not exist in classrooms.`
        );
        return false;
    }

    const targetLesson: Lesson = schedule[lessonIndex];

    // Перевіряємо, чи не буде конфлікту в новій аудиторії
    const conflict: Lesson | undefined = schedule.find(
        (l: Lesson): boolean =>
            l.id !== targetLesson.id &&
            l.dayOfWeek === targetLesson.dayOfWeek &&
            l.timeSlot === targetLesson.timeSlot &&
            l.classroomNumber === newClassroomNumber
    );

    if (conflict) {
        console.warn(
            `Cannot reassign classroom. Conflict with lesson id=${conflict.id}.`
        );
        return false;
    }

    schedule[lessonIndex] = {
        ...targetLesson,
        classroomNumber: newClassroomNumber,
    };

    return true;
}

/**
 * Видаляє заняття з розкладу.
 * Якщо заняття з таким id немає — нічого не робить.
 */
export function cancelLesson(lessonId: number): void {
    const index: number = schedule.findIndex(
        (lesson: Lesson): boolean => lesson.id === lessonId
    );

    if (index === -1) {
        console.warn(`Lesson with id=${lessonId} not found. Nothing to cancel.`);
        return;
    }

    schedule.splice(index, 1);
}

// -----------------------------
// 8. Приклад використання
// -----------------------------

// Невеликий хелпер, щоб красиво виводити заняття
function printLesson(lesson: Lesson): void {
    const course = courses.find((c) => c.id === lesson.courseId);
    const professor = professors.find((p) => p.id === lesson.professorId);

    const courseName: string = course ? course.name : "Unknown course";
    const professorName: string = professor ? professor.name : "Unknown professor";

    console.log(
        `#${lesson.id} | ${lesson.dayOfWeek} ${lesson.timeSlot} | ${courseName} | ${professorName} | ауд. ${lesson.classroomNumber}`
    );
}

function printSchedule(title: string): void {
    console.log("\n==============================");
    console.log(title);
    console.log("==============================");

    if (schedule.length === 0) {
        console.log("Розклад порожній.");
        return;
    }

    schedule.forEach(printLesson);
}

// ------------------------
// 1. Початкові дані
// ------------------------

const monday: DayOfWeek = "Monday";
const tuesday: DayOfWeek = "Tuesday";
const slot1: TimeSlot = "8:30-10:00";
const slot2: TimeSlot = "10:15-11:45";

const lecture: CourseType = "Lecture";
const practice: CourseType = "Practice";

// Додаємо викладачів
addProfessor({ id: 1, name: "Іван Іванов", department: "ІПЗ" });
addProfessor({ id: 2, name: "Олена Петренко", department: "Кібербезпека" });

// Аудиторії
classrooms.push(
    { number: "101", capacity: 30, hasProjector: true },
    { number: "202", capacity: 20, hasProjector: false },
    { number: "303", capacity: 40, hasProjector: true }
);

// Курси
courses.push(
    { id: 1, name: "TypeScript Basics", type: lecture },
    { id: 2, name: "Algorithms", type: practice }
);

// ------------------------
// 2. Додаємо заняття
// ------------------------

const lesson1: Lesson = {
    id: 1,
    courseId: 1,
    professorId: 1,
    classroomNumber: "101",
    dayOfWeek: monday,
    timeSlot: slot1,
};

const lesson2: Lesson = {
    id: 2,
    courseId: 2,
    professorId: 2,
    classroomNumber: "202",
    dayOfWeek: monday,
    timeSlot: slot1,
};

const lesson3: Lesson = {
    id: 3,
    courseId: 2,
    professorId: 1,
    classroomNumber: "101",
    dayOfWeek: tuesday,
    timeSlot: slot2,
};

console.log("Спроба додати заняття 1:", addLesson(lesson1)); // очікуємо true
console.log("Спроба додати заняття 2:", addLesson(lesson2)); // очікуємо true
console.log("Спроба додати заняття 3:", addLesson(lesson3)); // очікуємо true

// Спробуємо додати конфлікт по аудиторії (та ж аудиторія, день, слот)
const conflictLesson: Lesson = {
    id: 4,
    courseId: 1,
    professorId: 2,
    classroomNumber: "101", // вже зайнята lesson1 у цей час
    dayOfWeek: monday,
    timeSlot: slot1,
};

console.log(
    "Спроба додати конфліктне заняття:",
    addLesson(conflictLesson) // очікуємо false
);

// Виводимо розклад
printSchedule("Початковий розклад");

// ------------------------
// 3. Пошук вільних аудиторій
// ------------------------

const freeMondaySlot1: string[] = findAvailableClassrooms(slot1, monday);
console.log(
    "\nВільні аудиторії у понеділок 8:30-10:00:",
    freeMondaySlot1.join(", ")
);

// ------------------------
// 4. Розклад викладача
// ------------------------

const professor1Schedule: Lesson[] = getProfessorSchedule(1);
console.log("\nРозклад викладача #1 (Іван Іванов):");
professor1Schedule.forEach(printLesson);

// ------------------------
// 5. Аналіз: завантаженість аудиторії, популярний тип занять
// ------------------------

const utilization101: number = getClassroomUtilization("101");
console.log(
    `\nВикористання аудиторії 101: ${utilization101}% (відносно всіх можливих слотів)`
);

const mostPopularType: CourseType = getMostPopularCourseType();
console.log("\nНайпопулярніший тип занять:", mostPopularType);

// ------------------------
// 6. Зміна аудиторії та відміна заняття
// ------------------------

// Спробуємо пересадити lesson1 з 101 у 202 (у понеділок 8:30-10:00 там уже є lesson2)
console.log(
    "\nСпроба перенести заняття #1 в аудиторію 202 (очікуємо конфлікт):",
    reassignClassroom(1, "202")
);

// Пересадимо в 303 (вільна)
console.log(
    "Спроба перенести заняття #1 в аудиторію 303 (очікуємо успіх):",
    reassignClassroom(1, "303")
);

printSchedule("Розклад після зміни аудиторії для заняття #1");

// Тепер відміняємо заняття #2
console.log("\nВідміна заняття #2");
cancelLesson(2);

printSchedule("Розклад після відміни заняття #2");
