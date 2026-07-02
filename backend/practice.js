"use strict";
// ── BASIC TYPES ──────────────────────────────
let userName = "Chirag";
let age = 22;
let isStudent = true;
let scores = [85, 90, 78];
let city = "Hubballi";
let anything = "hello";
anything = 42;
let notSure = "hello";
let id = "abc123";
id = 456;
console.log(userName, age, isStudent, scores, city, id);
const myTask = {
    _id: "64f1a2b3",
    title: "Learn TypeScript",
    completed: false,
    createdAt: new Date(),
    userId: "user123"
};
const user1 = { username: "chirag", password: "hashed123" };
const user2 = { username: "test", password: "hashed456", email: "test@gmail.com" };
console.log(myTask, user1, user2);
// ── TYPED FUNCTIONS ──────────────────────────
function greet(personName, personAge) {
    return `Hello ${personName}, you are ${personAge} years old`;
}
console.log(greet("Chirag", 22));
const addNumbers = (a, b) => a + b;
console.log(addNumbers(3, 4));
const logTask = (task) => {
    console.log(`Task: ${task.title} — ${task.completed ? 'Done' : 'Pending'}`);
};
logTask(myTask);
const createGreeting = (personName, greeting) => {
    return `${greeting || 'Hello'}, ${personName}!`;
};
console.log(createGreeting("Chirag"));
console.log(createGreeting("Chirag", "Welcome"));
// ── GENERICS ─────────────────────────────────
function getFirstItem(arr) {
    return arr[0];
}
const firstNumber = getFirstItem([1, 2, 3]);
const firstString = getFirstItem(["a", "b"]);
const firstTask = getFirstItem([myTask]);
console.log(firstNumber, firstString, firstTask.title);
let currentFilter = 'all';
currentFilter = 'active';
console.log(currentFilter);
// ── ENUMS ────────────────────────────────────
const TaskStatus = {
    Pending: 'PENDING',
    Completed: 'COMPLETED',
    Archived: 'ARCHIVED'
};
const taskStatus = TaskStatus.Pending;
console.log(taskStatus);
const UserRole = {
    Admin: 'ADMIN',
    User: 'USER',
    Guest: 'GUEST'
};
const role = UserRole.Admin;
console.log(role);
