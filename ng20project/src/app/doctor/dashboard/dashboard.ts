import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PrescriptionComponent } from '../../prescription/prescription.component';
import { AppointmentService, AppointmentResponseDto, AppointmentCompletionDto } from '../../services/appointmentservices';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PrescriptionComponent]
})
export class DoctorDashboardComponent implements OnInit {
  activeTab: string = 'requests';
  pendingAppointments: AppointmentResponseDto[] = [];
  upcomingAppointments: AppointmentResponseDto[] = [];
  previousAppointments: AppointmentResponseDto[] = [];
  doctorId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  rejectionReason: string = '';
  customRejectionReason: string = '';
  showCustomReason: boolean = false;
  selectedAppointmentId: number | null = null;
  prescriptionMode: 'create' | 'view' = 'create';

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
  selectedPrescriptionAppointmentId: number | null = null;
  showPrescriptionForm: boolean = false;
  patientData: any = { name: 'N/A', age: 0, date: null };
  doctorData: any = { name: 'N/A', info: 'N/A' };

  constructor(private appointmentService: AppointmentService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDoctorId();
    if (this.doctorId) {
      this.loadDoctorData();
      this.loadAllAppointments();
    } else {
      console.error('Doctor ID is undefined');
      this.errorMessage = 'Doctor ID not found. Please log in again.';
    }
  }

  loadDoctorId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.doctorId = userData.doctorId || 0;
      console.log('Loaded doctorId:', this.doctorId);
    }
  }

  loadDoctorData(): void {
    if (!this.doctorId) {
      console.error('Cannot load doctor data: doctorId is undefined');
      this.doctorData = { name: 'N/A', info: 'N/A' };
      return;
    }
    this.http.get(`https://localhost:7090/api/Doctors/${this.doctorId}`).subscribe({
      next: (data: any) => {
        console.log('Doctor data response:', data);
        this.doctorData = {
          name: data.fullName || data.FullName || 'N/A',
          info: data.specialisation || data.Specialisation || 'N/A'
        };
        console.log('Updated doctorData:', this.doctorData);
      },
      error: (err) => {
        console.error('Error fetching doctor data:', err);
        this.errorMessage = 'Failed to load doctor data.';
        this.doctorData = { name: 'N/A', info: 'N/A' };
      }
    });
  }

  loadAllAppointments(): void {
    this.isLoading = true;

    this.appointmentService.getDoctorPendingAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.pendingAppointments = data;
        console.log('Pending appointments:', data);
      },
      error: (error) => {
        console.error('Error loading pending appointments:', error);
        this.errorMessage = 'Failed to load new appointment requests.';
      }
    });

    this.appointmentService.getDoctorUpcomingAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.upcomingAppointments = data;
        console.log('Upcoming appointments:', data);
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.errorMessage = 'Failed to load upcoming appointments.';
      }
    });

    this.appointmentService.getDoctorPreviousAppointments(this.doctorId).subscribe({
      next: (data) => {
        this.previousAppointments = data;
        this.isLoading = false;
        console.log('Previous appointments:', data);
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

  markAsPaid(appointmentId: number): void {
    if (!confirm('Confirm that payment has been received for this appointment?')) return;

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

  // Return bootstrap badge class for appointment statuses used in template
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'Confirmed': return 'bg-primary';
      case 'Pending': return 'bg-warning text-dark';
      case 'Rejected': return 'bg-danger';
      case 'Cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
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

  openPrescriptionForm(appointment: AppointmentResponseDto): void {
  if (!appointment || !appointment.appointmentId || !this.doctorId) {
    console.error('Invalid appointment or doctor data');
    this.errorMessage = 'Cannot open prescription form: Invalid data.';
    return;
  }

  this.selectedPrescriptionAppointmentId = appointment.appointmentId;
  this.showPrescriptionForm = true;
  this.prescriptionMode = 'create'; // Set mode for new prescription
  
  this.patientData = {
    name: appointment.patientName || 'N/A',
    age: 0,
    date: appointment.appointmentDate ? new Date(appointment.appointmentDate) : null
  };

  // Fetch complete patient data
  this.http.get(`https://localhost:7090/api/Appointments/patient-data`, {
    params: {
      appointmentId: appointment.appointmentId.toString(),
      doctorId: this.doctorId.toString(),
      userRole: 'Doctor'
    }
  }).subscribe({
    next: (data: any) => {
      this.patientData = {
        name: data.fullName || appointment.patientName || 'N/A',
        age: data.age || 0,
        date: data.appointmentDate ? new Date(data.appointmentDate) : null
      };
    },
    error: (err) => {
      console.error('Error fetching patient details:', err);
    }
  });
}

// Add new method to view prescription:
viewPrescription(appointment: AppointmentResponseDto): void {
  if (!appointment || !appointment.appointmentId) {
    this.errorMessage = 'Invalid appointment data.';
    return;
  }

  this.selectedPrescriptionAppointmentId = appointment.appointmentId;
  this.showPrescriptionForm = true;
  this.prescriptionMode = 'view'; // Set mode for viewing
  
  this.patientData = {
    name: appointment.patientName || 'N/A',
    age: 0,
    date: appointment.appointmentDate ? new Date(appointment.appointmentDate) : null
  };
}

  savePrescription(data: any) {
  if (!data.success) {
    this.errorMessage = data.message || 'Failed to save prescription';
    return;
  }

  // The prescription save endpoint now handles marking appointment as completed
  this.successMessage = data.message || 'Prescription saved and appointment completed successfully!';
  this.showPrescriptionForm = false;
  this.selectedPrescriptionAppointmentId = null;
  this.prescriptionMode = 'create';
  
  // Reload all appointments to reflect changes (appointment moved from upcoming to previous)
  this.loadAllAppointments();
  
  setTimeout(() => this.successMessage = '', 5000);
}
  cancelPrescription() {
    this.showPrescriptionForm = false;
    this.selectedPrescriptionAppointmentId = null;
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleString() : 'N/A';
  }
}