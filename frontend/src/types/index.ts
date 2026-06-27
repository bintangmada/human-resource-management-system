export interface PaginationMetadata {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMetadata;
  timestamp: string;
}

export interface DepartmentResponse {
  id: number;
  tenantId: number;
  name: string;
  code: string;
  status: number;
}

export interface JobResponse {
  id: number;
  tenantId: number;
  title: string;
  grade: string;
  status: number;
}

export interface EmployeeResponse {
  id: number;
  tenantId: number;
  employeeNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  jobId: number;
  jobTitle: string;
  jobGrade: string;
  joinedAt: string;
  status: number;
}

export interface AttendanceResponse {
  id: number;
  employeeId: number;
  employeeName?: string; // Optional field for displaying employee name in tables
  date: string;
  clockIn?: string;
  clockOut?: string;
  clockInLatitude?: number;
  clockInLongitude?: number;
  clockOutLatitude?: number;
  clockOutLongitude?: number;
  clockInStatus?: string;
  clockOutStatus?: string;
  notes?: string;
}

export interface GeofenceSettingResponse {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeter: number;
  isActive: boolean;
}

