// ── BASIC TYPES ──────────────────────────────
let userName: string = "Chirag";
let age: number = 22;
let isStudent: boolean = true;
let scores: number[] = [85, 90, 78];

let city = "Hubballi";

let anything: any = "hello";
anything = 42;

let notSure: unknown = "hello";

let id: string | number = "abc123";
id = 456;

console.log(userName, age, isStudent, scores, city, id);

// ── INTERFACES ───────────────────────────────
interface Task {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
}

const myTask: Task = {
  _id: "64f1a2b3",
  title: "Learn TypeScript",
  completed: false,
  createdAt: new Date(),
  userId: "user123"
};

interface User {
  username: string;
  password: string;
  email?: string;
}

const user1: User = { username: "chirag", password: "hashed123" };
const user2: User = { username: "test", password: "hashed456", email: "test@gmail.com" };

console.log(myTask, user1, user2);

// ── TYPED FUNCTIONS ──────────────────────────
function greet(personName: string, personAge: number): string {
  return `Hello ${personName}, you are ${personAge} years old`;
}

console.log(greet("Chirag", 22));

const addNumbers = (a: number, b: number): number => a + b;
console.log(addNumbers(3, 4));

const logTask = (task: Task): void => {
  console.log(`Task: ${task.title} — ${task.completed ? 'Done' : 'Pending'}`);
};

logTask(myTask);

const createGreeting = (personName: string, greeting?: string): string => {
  return `${greeting || 'Hello'}, ${personName}!`;
};

console.log(createGreeting("Chirag"));
console.log(createGreeting("Chirag", "Welcome"));

// ── GENERICS ─────────────────────────────────
function getFirstItem<T>(arr: T[]): T {
  return arr[0];
}

const firstNumber = getFirstItem<number>([1, 2, 3]);
const firstString = getFirstItem<string>(["a", "b"]);
const firstTask = getFirstItem<Task>([myTask]);

console.log(firstNumber, firstString, firstTask.title);

// ── TYPE ALIASES ─────────────────────────────
type ID = string | number;
type FilterType = 'all' | 'active' | 'completed';

let currentFilter: FilterType = 'all';
currentFilter = 'active';

console.log(currentFilter);

// ── ENUMS ────────────────────────────────────
const TaskStatus = {
  Pending: 'PENDING',
  Completed: 'COMPLETED',
  Archived: 'ARCHIVED'
} as const;

type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];

const taskStatus: TaskStatusType = TaskStatus.Pending;
console.log(taskStatus);

const UserRole = {
  Admin: 'ADMIN',
  User: 'USER',
  Guest: 'GUEST'
} as const;

type UserRoleType = typeof UserRole[keyof typeof UserRole];
const role: UserRoleType = UserRole.Admin;
console.log(role);