import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PatientProfile {
  patientId: number;
  userId: number;
  fullName: string;
  dob?: string; 
  gender?: string;
  contactNo?: string;
  address?: string;
  aadhaarNo?: string;  
}

export interface PatientUpdateDto {
  patientId: number;
  userId: number;
  fullName: string;
  dob?: string | null;
  gender?: string;
  contactNo?: string;
  address?: string;
  aadhaarNo?: string;
}

export interface PatientListDto {
  patientId: number;
  userId: number;
  fullName: string;
  email: string;
  dob?: string;
  age: number;
  gender?: string;
  contactNo?: string;
  address?: string;
  aadhaarNo?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'https://localhost:7090/api/Patients';

  constructor(private http: HttpClient) {}

  getPatientProfile(patientId: number): Observable<PatientProfile> {
    return this.http.get<PatientProfile>(`${this.apiUrl}/${patientId}`);
  }

  updatePatientProfile(patientId: number, data: PatientUpdateDto): Observable<any> {
  return this.http.put(`${this.apiUrl}/${patientId}`, data);
}

  checkContactExists(contactNo: string, excludePatientId?: number): Observable<{exists: boolean}> {
  const params = excludePatientId ? `?excludePatientId=${excludePatientId}` : '';
  return this.http.get<{exists: boolean}>(`${this.apiUrl}/check-contact/${contactNo}${params}`);
}

checkAadhaarExists(aadhaarNo: string, excludePatientId?: number): Observable<{exists: boolean}> {
  const params = excludePatientId ? `?excludePatientId=${excludePatientId}` : '';
  return this.http.get<{exists: boolean}>(`${this.apiUrl}/check-aadhaar/${aadhaarNo}${params}`);
}

getAllPatients(): Observable<PatientListDto[]> {
  return this.http.get<PatientListDto[]>(`${this.apiUrl}/list`);
}
}