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

export interface LeaveTypeResponse {
  id: number;
  name: string;
  defaultEntitlement: number;
  requiresApproval: boolean;
}

export interface LeaveBalanceResponse {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  entitlement: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface LeaveRequestResponse {
  id: number;
  employeeId: number;
  employeeName?: string; // resolved on frontend/backend side
  leaveTypeId: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string; // PENDING, APPROVED, REJECTED, CANCELLED
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface SalarySettingResponse {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeNumber?: string;
  baseSalary: number;
  allowanceFood: number;
  allowanceTransport: number;
  allowanceCommunication: number;
  bpjsEnabled: boolean;
  npwp?: string;
  ptkpStatus: string;
}

export interface PayrollDetailResponse {
  id: number;
  itemName: string;
  itemType: 'ALLOWANCE' | 'DEDUCTION' | 'TAX' | 'OTHER';
  amount: number;
}

export interface PayrollResponse {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeNumber?: string;
  month: number;
  year: number;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  bpjsEmployee: number;
  bpjsCompany: number;
  taxPPh21: number;
  netSalary: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  processedBy?: string;
  processedAt?: string;
  details?: PayrollDetailResponse[];
}

export interface ClaimCategoryResponse {
  id: number;
  tenantId: number;
  name: string;
  description: string;
  maxLimit: number;
  status: number; // 1 = Active, 0 = Inactive
}

export interface ClaimBalanceResponse {
  id: number;
  tenantId: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  categoryId: number;
  categoryName: string;
  year: number;
  allocatedAmount: number;
  utilizedAmount: number;
  pendingAmount: number;
  remainingAmount: number;
}

export interface ClaimRequestResponse {
  id: number;
  tenantId: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  categoryId: number;
  categoryName: string;
  title: string;
  amount: number;
  requestDate: string;
  description?: string;
  receiptUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  rejectionNotes?: string;
  createdAt: string;
}

export interface LoanInstallmentResponse {
  id: number;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'UNPAID' | 'PAID';
  payrollDeductionId?: number;
}

export interface LoanRequestResponse {
  id: number;
  tenantId: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  amount: number;
  interestRate: number;
  tenorMonths: number;
  monthlyInstallment: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID' | 'CANCELLED';
  approvedBy?: string;
  rejectionNotes?: string;
  disbursedDate?: string;
  createdAt: string;
  installments?: LoanInstallmentResponse[];
}

export interface PerformanceReviewResponse {
  id: number;
  tenantId: number;
  employeeId: number;
  employeeName: string;
  employeeNumber: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewPeriod: string;
  scoreJobKnowledge: number;
  scoreWorkQuality: number;
  scorePunctuality: number;
  scoreTeamwork: number;
  scoreCommunication: number;
  finalScore: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  feedback?: string;
  createdAt: string;
  createdBy?: string;
}

export interface JobPostingResponse {
  id: number;
  tenantId: number;
  title: string;
  departmentId?: number;
  departmentName?: string;
  description: string;
  requirements?: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  createdAt: string;
}

export interface JobApplicationResponse {
  id: number;
  tenantId: number;
  jobPostingId: number;
  jobTitle?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED';
  recruitmentNotes?: string;
  createdAt: string;
}

export interface AssetResponse {
  id: number;
  tenantId: number;
  assetName: string;
  serialNumber: string;
  category: string;
  purchaseDate?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'UNDER_REPAIR' | 'RETIRED';
  employeeId?: number;
  employeeName?: string;
  assignedDate?: string;
}

export interface AssetRequestResponse {
  id: number;
  tenantId: number;
  assetId?: number;
  assetName: string;
  employeeId: number;
  employeeName: string;
  requestType: 'REQUISITION' | 'REPAIR' | 'RETURN';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
}

export interface AnnouncementResponse {
  id: number;
  tenantId: number;
  title: string;
  content: string;
  priority: 'INFO' | 'WARNING' | 'URGENT';
  targetAudience: 'ALL' | 'HR_ONLY' | 'MANAGER_ONLY';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  createdBy?: string;
}

export interface CompanyEventResponse {
  id: number;
  tenantId: number;
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string;
  eventType: 'HOLIDAY' | 'MEETING' | 'TRAINING' | 'GATHERING' | 'OTHER';
  location?: string;
  visibility: 'ALL' | 'HR_ONLY' | 'MANAGERS_ONLY';
  createdAt: string;
}



