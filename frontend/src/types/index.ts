// Task shape — mirrors what your backend returns
export interface Task {
  _id: string;
  title: string;
  completed: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

// User shape for auth context
export interface AuthUser {
  username: string;
}

// Paginated response shape — mirrors backend's response
export interface PaginatedTaskResponse {
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  totalTasks: number;
}

// Auth context shape
export interface AuthContextType {
  user: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
}

// Filter options
export type FilterType = 'all' | 'active' | 'completed';