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
