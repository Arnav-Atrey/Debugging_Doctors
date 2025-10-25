import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminRegistrationDto {
  email: string;
  pswdHash: string;
  fullName: string;
  department?: string;
  contactNo?: string;
}

export interface AdminDto {
  adminId: number;
  userId: number;
  fullName: string;
  email: string;
  department?: string;
  contactNo?: string;
  isApproved: boolean;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface AdminUpdateDto {
  adminId: number;
  userId: number;
  fullName: string;
  department?: string;
  contactNo?: string;
}

export interface AdminStatsDto {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  pendingAdmins: number;
}

export interface AdminApprovalDto {
  adminId: number;
  approvedBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://localhost:7090/api/Admins';
  private userApiUrl = 'https://localhost:7090/api/Users';

  constructor(private http: HttpClient) {}

  registerAdmin(data: AdminRegistrationDto): Observable<any> {
    return this.http.post(`${this.userApiUrl}/register-admin`, data);
  }

  getAllAdmins(): Observable<AdminDto[]> {
    return this.http.get<AdminDto[]>(this.apiUrl);
  }

  getPendingAdmins(): Observable<AdminDto[]> {
    return this.http.get<AdminDto[]>(`${this.apiUrl}/pending`);
  }

  getAdmin(id: number): Observable<AdminDto> {
    return this.http.get<AdminDto>(`${this.apiUrl}/${id}`);
  }

  approveAdmin(adminId: number, approvedBy: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${adminId}/approve`, { adminId, approvedBy });
  }

  rejectAdmin(adminId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${adminId}/reject`, {});
  }

  getStats(): Observable<AdminStatsDto> {
    return this.http.get<AdminStatsDto>(`${this.apiUrl}/stats`);
  }

  updateAdmin(adminId: number, data: AdminUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${adminId}`, data);
  }
}