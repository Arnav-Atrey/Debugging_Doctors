import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AppointmentService, AppointmentResponseDto, AppointmentCompletionDto } from '../../services/appointmentservices';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class DoctorDashboardComponent implements OnInit {
  activeTab: string = 'requests'; // requests, upcoming, previous
  
  pendingAppointments: AppointmentResponseDto[] = [];
  upcomingAppointments: AppointmentResponseDto[] = [];
  previousAppointments: AppointmentResponseDto[] = [];
  
  doctorId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  
  // For rejection modal
  rejectionReason: string = '';
  customRejectionReason: string = '';
  showCustomReason: boolean = false;
  selectedAppointmentId: number | null = null

  // Predefined rejection reasons
  rejectionReasons: string[] = [
    'Not available on selected date/time',
    'Emergency situation - Cannot accommodate',
    'Other commitments at that time',
    'Patient needs specialist consultation first',
    'Technical/Administrative error',
    'Other'
  ];
  
  // For completion modal
  completionData: AppointmentCompletionDto = {
    diagnosis: '',
    medicines: '',
    invoiceAmount: undefined
  };
  selectedCompletionAppointment: AppointmentResponseDto | null = null;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadDoctorId();
    this.loadAllAppointments();
  }

  loadDoctorId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.doctorId = userData.doctorId || 0;
    }
  }

  loadAllAppointments(): void {
    this.isLoading = true;
    
    // Load new requests
    this.appointmentService.getDoctorPendingAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.pendingAppointments = data;
      },
      error: (error) => {
        console.error('Error loading pending appointments:', error);
        this.errorMessage = 'Failed to load new appointment requests.';
      }
    });

    // Load upcoming appointments
    this.appointmentService.getDoctorUpcomingAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.upcomingAppointments = data;
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.errorMessage = 'Failed to load upcoming appointments.';
      }
    });

    // Load previous appointments
    this.appointmentService.getDoctorPreviousAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.previousAppointments = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading previous appointments:', error);
        this.errorMessage = 'Failed to load previous appointments.';
        this.isLoading = false;
      }
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirmAppointment(appointmentId: number): void {
    this.appointmentService.confirmAppointment(appointmentId).subscribe({
      next: () => {
        this.successMessage = 'Appointment confirmed successfully!';
        this.loadAllAppointments();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error confirming appointment:', error);
        this.errorMessage = 'Failed to confirm appointment.';
      }
    });
  }

  openRejectModal(appointmentId: number): void {
    this.selectedAppointmentId = appointmentId;
    this.rejectionReason = '';
    this.customRejectionReason = '';
    this.showCustomReason = false;
  }

  onRejectionReasonChange(): void {
    this.showCustomReason = this.rejectionReason === 'Other';
    if (!this.showCustomReason) {
      this.customRejectionReason = '';
    }
  }

  markAsPaid(appointmentId: number): void {
  if (!confirm('Confirm that payment has been received for this appointment?')) {
    return;
  }

  this.appointmentService.updatePaymentStatus(appointmentId, 'Paid').subscribe({
    next: () => {
      this.successMessage = 'Payment marked as received!';
      this.loadAllAppointments();
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      console.error('Error updating payment:', error);
      this.errorMessage = 'Failed to update payment status.';
    }
  });
}

getPaymentBadgeClass(status: string): string {
  switch (status) {
    case 'Paid': return 'bg-success';
    case 'Pending': return 'bg-warning text-dark';
    case 'Cancelled': return 'bg-secondary';
    default: return 'bg-secondary';
  }
}

  rejectAppointment(): void {
    if (!this.selectedAppointmentId) return;

    // Validate that a reason is selected
    if (!this.rejectionReason) {
      this.errorMessage = 'Please select a reason for rejection.';
      return;
    }

    // If "Other" is selected, validate custom reason
    if (this.rejectionReason === 'Other' && !this.customRejectionReason.trim()) {
      this.errorMessage = 'Please specify the reason for rejection.';
      return;
    }

    // Use custom reason if "Other" is selected, otherwise use selected reason
    const finalReason = this.rejectionReason === 'Other' 
      ? this.customRejectionReason 
      : this.rejectionReason;

    this.appointmentService.rejectAppointment(this.selectedAppointmentId, finalReason).subscribe({
      next: () => {
        this.successMessage = 'Appointment rejected.';
        this.loadAllAppointments();
        this.selectedAppointmentId = null;
        this.rejectionReason = '';
        this.customRejectionReason = '';
        this.showCustomReason = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error rejecting appointment:', error);
        this.errorMessage = 'Failed to reject appointment.';
      }
    });
  }

  openCompleteModal(appointment: AppointmentResponseDto): void {
    this.selectedCompletionAppointment = appointment;
    this.completionData = {
      diagnosis: '',
      medicines: '',
      invoiceAmount: undefined
    };
  }

  completeAppointment(): void {
    if (!this.selectedCompletionAppointment) return;

    this.appointmentService.completeAppointment(
      this.selectedCompletionAppointment.appointmentId, 
      this.completionData
    ).subscribe({
      next: () => {
        this.successMessage = 'Appointment marked as completed!';
        this.loadAllAppointments();
        this.selectedCompletionAppointment = null;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error completing appointment:', error);
        this.errorMessage = 'Failed to complete appointment.';
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}