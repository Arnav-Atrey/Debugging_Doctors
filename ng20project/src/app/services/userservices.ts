import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginDto {
  email: string;
  pswdHash: string;
}

export interface AdminRegistrationDto {
  email: string;
  pswdHash: string;
  fullName: string;
  department?: string;
  contactNo?: string;
}

export interface UserRegistrationDto {
  email: string;
  pswdHash: string;
  role: string;
}

export interface UserDto {
  userId: number;
  email: string;
  role: string;
  createdAt: string;
}

export interface LoginResponseDto {
  userId: number;
  email: string;
  role: string;
  patientId?: number;
  doctorId?: number;
  fullName?: string;
}

export interface DoctorDetailsDto {
  fullName: string;
  specialisation: string;
  hpid: string;
  contactNo: string;
}

export interface Doctor {
  docId: number;
  userId: number;
  fullName: string;
  specialisation: string;
  hpid: string;
  availability: string;
  contactNo: string;
}

export interface PatientDetailsDto {
  fullName: string;
  dob: string | null;  // ISO date string format
  gender: string;
  contactNo: string;
  address: string;
  aadhaar_no: string;
}

export interface Patient {
  patientId: number;
  userId: number;
  fullName: string;
  dob: string | null;
  gender: string;
  contactNo: string;
  address: string;
  aadhaar_no: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7090/api/Users'; // Update with your API URL

  constructor(private http: HttpClient) {}

  register(data: UserRegistrationDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, data);
  }

  login(data: LoginDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/login`, data);
  }

  addDoctorDetails(userId: number, doctorDetails: DoctorDetailsDto): Observable<Doctor> {
    return this.http.post<Doctor>(`${this.apiUrl}/${userId}/doctor-details`, doctorDetails);
  }

  addPatientDetails(userId: number, patientDetails: PatientDetailsDto): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/${userId}/patient-details`, patientDetails);
  }
  
  registerAdmin(data: AdminRegistrationDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-admin`, data);
  }

}