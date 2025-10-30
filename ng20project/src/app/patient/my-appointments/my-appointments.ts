import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService, AppointmentResponseDto } from '../../services/appointmentservices';
import { PrescriptionComponent } from '../../prescription/prescription.component';

@Component({
  selector: 'app-my-appointments',
  templateUrl: './my-appointments.html',
  styleUrls: ['./my-appointments.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, PrescriptionComponent]
})
export class MyAppointmentsComponent implements OnInit {
  appointments: AppointmentResponseDto[] = [];
  patientId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPrescriptionModal: boolean = false;
  selectedAppointmentForPrescription: AppointmentResponseDto | null = null;


  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadPatientId();
    this.loadAppointments();
  }

  loadPatientId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.patientId = userData.patientId || 1;
    }
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.errorMessage = 'Failed to load appointments.';
        this.isLoading = false;
      }
    });
  }

  cancelAppointment(appointmentId: number): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    this.appointmentService.cancelAppointment(appointmentId, 'Patient cancelled').subscribe({
      next: () => {
        this.successMessage = 'Appointment cancelled successfully.';
        this.loadAppointments();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error cancelling appointment:', error);
        this.errorMessage = 'Failed to cancel appointment.';
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning';
      case 'Confirmed': return 'bg-success';
      case 'Completed': return 'bg-info';
      case 'Cancelled': return 'bg-secondary';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPaymentBadgeClass(status: string): string {
    switch (status) {
      case 'Paid': return 'bg-success';
      case 'Pending': return 'bg-warning text-dark';
      case 'Cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  canCancel(status: string): boolean {
    return status === 'Pending' || status === 'Confirmed';
  }

  viewPrescription(appointment: AppointmentResponseDto): void {
  this.selectedAppointmentForPrescription = appointment;
  this.showPrescriptionModal = true;
}

closePrescriptionModal(): void {
  this.showPrescriptionModal = false;
  this.selectedAppointmentForPrescription = null;
}
}