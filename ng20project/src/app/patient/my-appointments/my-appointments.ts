import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService, AppointmentResponseDto } from '../../services/appointmentservices';
import { PrescriptionComponent } from '../../prescription/prescription.component';
import { HttpClient } from '@angular/common/http';

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
  selectedAppointmentForPrescription: any = null;


  constructor(
    private appointmentService: AppointmentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadPatientId();
    this.loadAppointments();
  }

  loadPatientId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.patientId = userData.patientId || 0;
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

getAppointmentDate(dateString: string): Date | null {
  return dateString ? new Date(dateString) : null;
}

// viewPrescription(appointment: AppointmentResponseDto): void {
//   this.selectedAppointmentForPrescription = appointment;
//   this.showPrescriptionModal = true;
// }

  viewPrescription(appointment: AppointmentResponseDto): void {
    console.log('Viewing prescription for appointment:', appointment);
    
    // Use the patient-data endpoint which returns complete patient info including age
    this.http.get(`https://localhost:7090/api/Appointments/patient-data`, {
      params: {
        appointmentId: appointment.appointmentId.toString(),
        doctorId: appointment.doctorId.toString(),
        userRole: 'Patient'
      }
    }).subscribe({
      next: (patientData: any) => {
        console.log('Complete patient data fetched:', patientData);
        
        // Fetch doctor data to get specialisation
        this.http.get(`https://localhost:7090/api/Doctors/${appointment.doctorId}`).subscribe({
          next: (doctorData: any) => {
            console.log('Doctor data fetched:', doctorData);
            
            this.selectedAppointmentForPrescription = {
              appointmentId: appointment.appointmentId,
              patientName: patientData.fullName || appointment.patientName,
              age: patientData.age || 0, // Age is calculated on backend
              appointmentDate: appointment.appointmentDate,
              doctorName: doctorData.fullName || appointment.doctorName,
              doctorSpecialization: doctorData.specialisation || appointment.specialisation,
              invoiceAmount: appointment.invoiceAmount
            };
            
            console.log('Selected appointment for prescription:', this.selectedAppointmentForPrescription);
            this.showPrescriptionModal = true;
          },
          error: (err) => {
            console.error('Error fetching doctor data:', err);
            // Fallback to appointment data
            this.selectedAppointmentForPrescription = {
              appointmentId: appointment.appointmentId,
              patientName: patientData.fullName || appointment.patientName,
              age: patientData.age || 0,
              appointmentDate: appointment.appointmentDate,
              doctorName: appointment.doctorName,
              doctorSpecialization: appointment.specialisation,
              invoiceAmount: appointment.invoiceAmount
            };
            this.showPrescriptionModal = true;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching patient data:', err);
        // Fallback - calculate age from DOB if available
        let calculatedAge = 0;
        if (appointment.appointmentDate) {
          // This is a fallback; ideally backend should provide age
          calculatedAge = 0; // We don't have DOB in appointment response
        }
        
        this.selectedAppointmentForPrescription = {
          appointmentId: appointment.appointmentId,
          patientName: appointment.patientName,
          age: calculatedAge,
          appointmentDate: appointment.appointmentDate,
          doctorName: appointment.doctorName,
          doctorSpecialization: appointment.specialisation,
          invoiceAmount: appointment.invoiceAmount
        };
        this.showPrescriptionModal = true;
      }
    });
  }
  closePrescriptionModal(): void {
    this.showPrescriptionModal = false;
    this.selectedAppointmentForPrescription = null;
  }
}