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

// Driver Master types
export interface Driver {
  _id: string;
  driverId: string;
  name: string;
  mobile: string;
  altMobile?: string;
  address?: string;
  aadhaar: string;
  dlNumber: string;
  dlExpiry: string;
  factory: 'DBP' | 'MRS1' | 'KOLAR';
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DriverFormData {
  name: string;
  mobile: string;
  altMobile: string;
  address: string;
  aadhaar: string;
  dlNumber: string;
  dlExpiry: string;
  factory: 'DBP' | 'MRS1' | 'KOLAR';
  status: 'Active' | 'Inactive';
}

export type FactoryType = 'DBP' | 'MRS1' | 'KOLAR';
export type DriverStatus = 'Active' | 'Inactive';

// Vehicle Master types
export type VehicleType = 'Truck' | 'Van' | 'Bike' | 'Tempo';
export type VehicleStatus = 'ON ROAD' | 'MAINTENANCE' | 'STANDBY';

export interface AssignedDriver {
  _id: string;
  name: string;
  mobile: string;
  driverId: string;
}

export interface Vehicle {
  _id: string;
  vehicleId: string;
  registrationNumber: string;
  type: VehicleType;
  factory: FactoryType;
  status: VehicleStatus;
  assignedDriver?: AssignedDriver | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  registrationNumber: string;
  type: VehicleType;
  factory: FactoryType;
  status: VehicleStatus;
  assignedDriver?: string | null;
}