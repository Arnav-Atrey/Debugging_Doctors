import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentBookingDto {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  symptoms?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AppointmentCompletionDto {
  diagnosis?: string;
  medicines?: string;
  invoiceAmount?: number;
}

export interface AppointmentResponseDto {
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialisation: string;
  appointmentDate: string;
  appointmentStatus: string;
  symptoms?: string;
  diagnosis?: string;
  medicines?: string;
  invoiceStatus: string;
  invoiceAmount?: number;
  age?: number;
}

export interface AppointmentActionDto {
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'https://localhost:7090/api/Appointments';

  constructor(private http: HttpClient) {}

  // Book appointment
  bookAppointment(data: AppointmentBookingDto): Observable<AppointmentResponseDto> {
    return this.http.post<AppointmentResponseDto>(`${this.apiUrl}/book`, data);
  }

  // Get patient appointments
  getPatientAppointments(patientId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  // Get doctor pending appointments
  getDoctorPendingAppointments(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/doctor/${doctorId}/pending`);
  }

  // Get doctor confirmed appointments
  getDoctorConfirmedAppointments(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/doctor/${doctorId}/confirmed`);
  }

  // Confirm appointment (doctor accepts)
  confirmAppointment(appointmentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/confirm`, {});
  }

  // Reject appointment (doctor rejects)
  rejectAppointment(appointmentId: number, reason?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/reject`, { reason });
  }

  // Cancel appointment
  cancelAppointment(appointmentId: number, reason?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/cancel`, { reason });
  }

  // Get single appointment
  getAppointment(appointmentId: number): Observable<AppointmentResponseDto> {
    return this.http.get<AppointmentResponseDto>(`${this.apiUrl}/${appointmentId}`);
  }

    // Get doctor previous appointments
  getDoctorPreviousAppointments(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/doctor/${doctorId}/previous`);
  }

  // Get doctor upcoming appointments
  getDoctorUpcomingAppointments(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.apiUrl}/doctor/${doctorId}/upcoming`);
  }

  // Complete appointment
  completeAppointment(appointmentId: number, data: AppointmentCompletionDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/complete`, data);
}

updatePaymentStatus(appointmentId: number, status: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/${appointmentId}/payment`, { invoiceStatus: status });
}

getAvailableSlots(doctorId: number, date: string): Observable<TimeSlot[]> {
  return this.http.get<TimeSlot[]>(`${this.apiUrl}/doctor/${doctorId}/available-slots?date=${date}`);
}

}