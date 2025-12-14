"use strict";
// -----------------------------
// 1. Базові union та type aliases
// -----------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedule = exports.courses = exports.classrooms = exports.professors = void 0;
exports.addProfessor = addProfessor;
exports.validateLesson = validateLesson;
exports.addLesson = addLesson;
exports.findAvailableClassrooms = findAvailableClassrooms;
exports.getProfessorSchedule = getProfessorSchedule;
exports.getClassroomUtilization = getClassroomUtilization;
exports.getMostPopularCourseType = getMostPopularCourseType;
exports.reassignClassroom = reassignClassroom;
exports.cancelLesson = cancelLesson;
// Допоміжні константи для аналізу (використовуються у getClassroomUtilization)
const ALL_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
];
const ALL_SLOTS = [
    "8:30-10:00",
    "10:15-11:45",
    "12:15-13:45",
    "14:00-15:30",
    "15:45-17:15",
];
// -----------------------------
// 3. Масиви даних (умовна "база")
// -----------------------------
exports.professors = [];
exports.classrooms = [];
exports.courses = [];
exports.schedule = [];
// -----------------------------
// 4. Додавання даних
// -----------------------------
/**
 * Додає нового професора, якщо ще немає професора з таким id.
 */
function addProfessor(professor) {
    const exists = exports.professors.some((p) => p.id === professor.id);
    if (exists) {
        console.warn(`Professor with id=${professor.id} already exists.`);
        return;
    }
    exports.professors.push(professor);
}
/**
 * Перевіряє, чи створює нове заняття конфлікт у розкладі:
 * - той самий викладач, той самий день і слот
 * - та сама аудиторія, той самий день і слот
 */
function validateLesson(lesson) {
    for (const existing of exports.schedule) {
        const sameTimeAndDay = existing.dayOfWeek === lesson.dayOfWeek &&
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
function addLesson(lesson) {
    const conflict = validateLesson(lesson);
    if (conflict !== null) {
        console.warn("Lesson conflict:", conflict.type, conflict.lessonDetails);
        return false;
    }
    exports.schedule.push(lesson);
    return true;
}
// -----------------------------
// 5. Пошук та фільтрація
// -----------------------------
/**
 * Повертає номери вільних аудиторій у вказаний день і слот.
 */
function findAvailableClassrooms(timeSlot, dayOfWeek) {
    const occupiedNumbers = exports.schedule
        .filter((lesson) => lesson.dayOfWeek === dayOfWeek && lesson.timeSlot === timeSlot)
        .map((lesson) => lesson.classroomNumber);
    const available = exports.classrooms
        .filter((room) => !occupiedNumbers.includes(room.number))
        .map((room) => room.number);
    return available;
}
/**
 * Повертає розклад конкретного викладача.
 */
function getProfessorSchedule(professorId) {
    return exports.schedule.filter((lesson) => lesson.professorId === professorId);
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
function getClassroomUtilization(classroomNumber) {
    const totalSlots = ALL_DAYS.length * ALL_SLOTS.length;
    if (totalSlots === 0) {
        return 0;
    }
    const usedSlots = exports.schedule.filter((lesson) => lesson.classroomNumber === classroomNumber).length;
    const utilization = (usedSlots / totalSlots) * 100;
    // Округлимо до одного знаку після коми
    return Math.round(utilization * 10) / 10;
}
/**
 * Визначає найбільш популярний тип занять за кількістю Lesson.
 */
function getMostPopularCourseType() {
    if (exports.schedule.length === 0) {
        // Базова обробка випадку без занять
        console.warn("Schedule is empty. Returning default course type 'Lecture'.");
        return "Lecture";
    }
    // Лічильник для кожного типу
    const counts = {
        Lecture: 0,
        Seminar: 0,
        Lab: 0,
        Practice: 0,
    };
    for (const lesson of exports.schedule) {
        const course = exports.courses.find((c) => c.id === lesson.courseId);
        // Якщо не знайшли курс — пропускаємо, щоб не ламати статистику
        if (!course) {
            continue;
        }
        counts[course.type] = counts[course.type] + 1;
    }
    // Визначаємо максимальний тип
    let mostPopular = "Lecture";
    let maxCount = counts["Lecture"];
    ["Seminar", "Lab", "Practice"].forEach((type) => {
        const value = counts[type];
        if (value > maxCount) {
            maxCount = value;
            mostPopular = type;
        }
    });
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
function reassignClassroom(lessonId, newClassroomNumber) {
    const lessonIndex = exports.schedule.findIndex((lesson) => lesson.id === lessonId);
    if (lessonIndex === -1) {
        console.warn(`Lesson with id=${lessonId} not found.`);
        return false;
    }
    const classroomExists = exports.classrooms.some((room) => room.number === newClassroomNumber);
    if (!classroomExists) {
        console.warn(`Classroom with number=${newClassroomNumber} does not exist in classrooms.`);
        return false;
    }
    const targetLesson = exports.schedule[lessonIndex];
    // Перевіряємо, чи не буде конфлікту в новій аудиторії
    const conflict = exports.schedule.find((l) => l.id !== targetLesson.id &&
        l.dayOfWeek === targetLesson.dayOfWeek &&
        l.timeSlot === targetLesson.timeSlot &&
        l.classroomNumber === newClassroomNumber);
    if (conflict) {
        console.warn(`Cannot reassign classroom. Conflict with lesson id=${conflict.id}.`);
        return false;
    }
    exports.schedule[lessonIndex] = Object.assign(Object.assign({}, targetLesson), { classroomNumber: newClassroomNumber });
    return true;
}
/**
 * Видаляє заняття з розкладу.
 * Якщо заняття з таким id немає — нічого не робить.
 */
function cancelLesson(lessonId) {
    const index = exports.schedule.findIndex((lesson) => lesson.id === lessonId);
    if (index === -1) {
        console.warn(`Lesson with id=${lessonId} not found. Nothing to cancel.`);
        return;
    }
    exports.schedule.splice(index, 1);
}
// -----------------------------
// 8. Приклад використання
// -----------------------------
// Невеликий хелпер, щоб красиво виводити заняття
function printLesson(lesson) {
    const course = exports.courses.find((c) => c.id === lesson.courseId);
    const professor = exports.professors.find((p) => p.id === lesson.professorId);
    const courseName = course ? course.name : "Unknown course";
    const professorName = professor ? professor.name : "Unknown professor";
    console.log(`#${lesson.id} | ${lesson.dayOfWeek} ${lesson.timeSlot} | ${courseName} | ${professorName} | ауд. ${lesson.classroomNumber}`);
}
function printSchedule(title) {
    console.log("\n==============================");
    console.log(title);
    console.log("==============================");
    if (exports.schedule.length === 0) {
        console.log("Розклад порожній.");
        return;
    }
    exports.schedule.forEach(printLesson);
}
// ------------------------
// 1. Початкові дані
// ------------------------
const monday = "Monday";
const tuesday = "Tuesday";
const slot1 = "8:30-10:00";
const slot2 = "10:15-11:45";
const lecture = "Lecture";
const practice = "Practice";
// Додаємо викладачів
addProfessor({ id: 1, name: "Іван Іванов", department: "ІПЗ" });
addProfessor({ id: 2, name: "Олена Петренко", department: "Кібербезпека" });
// Аудиторії
exports.classrooms.push({ number: "101", capacity: 30, hasProjector: true }, { number: "202", capacity: 20, hasProjector: false }, { number: "303", capacity: 40, hasProjector: true });
// Курси
exports.courses.push({ id: 1, name: "TypeScript Basics", type: lecture }, { id: 2, name: "Algorithms", type: practice });
// ------------------------
// 2. Додаємо заняття
// ------------------------
const lesson1 = {
    id: 1,
    courseId: 1,
    professorId: 1,
    classroomNumber: "101",
    dayOfWeek: monday,
    timeSlot: slot1,
};
const lesson2 = {
    id: 2,
    courseId: 2,
    professorId: 2,
    classroomNumber: "202",
    dayOfWeek: monday,
    timeSlot: slot1,
};
const lesson3 = {
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
const conflictLesson = {
    id: 4,
    courseId: 1,
    professorId: 2,
    classroomNumber: "101", // вже зайнята lesson1 у цей час
    dayOfWeek: monday,
    timeSlot: slot1,
};
console.log("Спроба додати конфліктне заняття:", addLesson(conflictLesson) // очікуємо false
);
// Виводимо розклад
printSchedule("Початковий розклад");
// ------------------------
// 3. Пошук вільних аудиторій
// ------------------------
const freeMondaySlot1 = findAvailableClassrooms(slot1, monday);
console.log("\nВільні аудиторії у понеділок 8:30-10:00:", freeMondaySlot1.join(", "));
// ------------------------
// 4. Розклад викладача
// ------------------------
const professor1Schedule = getProfessorSchedule(1);
console.log("\nРозклад викладача #1 (Іван Іванов):");
professor1Schedule.forEach(printLesson);
// ------------------------
// 5. Аналіз: завантаженість аудиторії, популярний тип занять
// ------------------------
const utilization101 = getClassroomUtilization("101");
console.log(`\nВикористання аудиторії 101: ${utilization101}% (відносно всіх можливих слотів)`);
const mostPopularType = getMostPopularCourseType();
console.log("\nНайпопулярніший тип занять:", mostPopularType);
// ------------------------
// 6. Зміна аудиторії та відміна заняття
// ------------------------
// Спробуємо пересадити lesson1 з 101 у 202 (у понеділок 8:30-10:00 там уже є lesson2)
console.log("\nСпроба перенести заняття #1 в аудиторію 202 (очікуємо конфлікт):", reassignClassroom(1, "202"));
// Пересадимо в 303 (вільна)
console.log("Спроба перенести заняття #1 в аудиторію 303 (очікуємо успіх):", reassignClassroom(1, "303"));
printSchedule("Розклад після зміни аудиторії для заняття #1");
// Тепер відміняємо заняття #2
console.log("\nВідміна заняття #2");
cancelLesson(2);
printSchedule("Розклад після відміни заняття #2");
