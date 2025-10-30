import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentResponseDto {
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialisation: string;
  appointmentDate: string;
  appointmentStatus: string;
  symptoms: string;
  diagnosis: string;
  medicines: string;
  invoiceStatus: string;
  invoiceAmount: number;
}

export interface AppointmentCompletionDto {
  diagnosis: string;
  medicines: string;
  invoiceAmount?: number;
}

export interface AppointmentBookingDto {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  symptoms: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'https://localhost:7090';

  constructor(private http: HttpClient) {}

  getDoctorPendingAppointments(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/api/Appointments/doctor/${doctorId}/pending`);
  }

  getDoctorUpcomingAppointments(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/api/Appointments/doctor/${doctorId}/upcoming`);
  }

  getDoctorPreviousAppointments(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/api/Appointments/doctor/${doctorId}/previous`);
  }

  getPatientAppointments(patientId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/api/Appointments/patient/${patientId}`);
  }

  getAvailableSlots(doctorId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/api/Appointments/doctor/${doctorId}/available-slots`, {
      params: { date }
    });
  }

  bookAppointment(bookingData: AppointmentBookingDto): Observable<AppointmentResponseDto> {
    return this.http.post<AppointmentResponseDto>(`${this.apiUrl}/api/Appointments/book`, bookingData);
  }

  confirmAppointment(appointmentId: number):Observable<any> {
    console.log(`${this.apiUrl}/api/Appointments/${appointmentId}/confirm`)
    return this.http.put(`${this.apiUrl}/api/Appointments/${appointmentId}/confirm`, {});
  }

  rejectAppointment(appointmentId: number, reason: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Appointments/${appointmentId}/reject`, { reason });
  }

  cancelAppointment(appointmentId: number, reason: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Appointments/${appointmentId}/cancel`, { reason });
  }

  updatePaymentStatus(appointmentId: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Appointments/${appointmentId}/payment`, { invoiceStatus: status });
  }

  completeAppointment(appointmentId: number, data: AppointmentCompletionDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/api/Appointments/${appointmentId}/complete`, data);
  }
}