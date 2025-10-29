import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Doctor {
  docId: number;
  userId: number;
  fullName: string;
  specialisation: string;
  hpid: string;
  availability: string;
  contactNo: string;
  deletedAt?: string;
}

export interface DoctorUpdateDto {
  docId: number;
  userId: number;
  fullName: string;
  specialisation?: string;
  hpid?: string;
  availability?: string;
  contactNo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'https://localhost:7090/api/Doctors';

  constructor(private http: HttpClient) {}

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.apiUrl);
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
  }

  getDoctorsBySpecialization(specialization: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/specialization/${specialization}`);
  }

  updateDoctor(id: number, data: DoctorUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, data);
  }
  softDeleteDoctor(doctorId: number, deletedBy: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${doctorId}`, {
      body: { deletedBy }
    });
  }

  getDeletedDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/deleted`);
  }

  restoreDoctor(doctorId: number, restoredBy: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${doctorId}/restore`, { restoredBy });
  }

  permanentDeleteDoctor(doctorId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${doctorId}/permanent`);
  }
}