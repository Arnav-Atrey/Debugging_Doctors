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
  selectedAppointmentId: number | null = null;
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

  // INVOICE DATA
  invoiceData: any = null;

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
  }

  rejectAppointment(): void {
    if (!this.selectedAppointmentId) return;

    this.appointmentService.rejectAppointment(this.selectedAppointmentId, this.rejectionReason).subscribe({
      next: () => {
        this.successMessage = 'Appointment rejected.';
        this.loadAllAppointments();
        this.selectedAppointmentId = null;
        this.rejectionReason = '';
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
      console.error('Invalid appointment or doctor data:', { appointment, doctorId: this.doctorId });
      this.errorMessage = 'Cannot open prescription form: Invalid appointment or doctor data.';
      return;
    }

    this.selectedPrescriptionAppointmentId = appointment.appointmentId;
    this.showPrescriptionForm = true;
    this.patientData = {
      name: appointment.patientName || 'N/A',
      age: 0,
      date: appointment.appointmentDate ? new Date(appointment.appointmentDate) : null
    };

    this.http.get(`https://localhost:7090/api/Appointments/patient-data`, {
      params: {
        appointmentId: appointment.appointmentId.toString(),
        doctorId: this.doctorId.toString(),
        userRole: 'Doctor'
      }
    }).subscribe({
      next: (data: any) => {
        console.log('Patient data response:', data);
        this.patientData = {
          name: data.fullName || appointment.patientName || 'N/A',
          age: data.age || 0,
          date: data.appointmentDate ? new Date(data.appointmentDate) : (appointment.appointmentDate ? new Date(appointment.appointmentDate) : null)
        };
        console.log('Updated patientData:', this.patientData);
      },
      error: (err) => {
        console.error('Error fetching patient details:', err);
        this.errorMessage = 'Failed to load patient data. Using available data.';
        this.patientData = {
          name: appointment.patientName || 'N/A',
          age: 0,
          date: appointment.appointmentDate ? new Date(appointment.appointmentDate) : null
        };
        console.log('Fallback patientData:', this.patientData);
      }
    });
  }

  savePrescription(data: any) {
    const payload = {
      AppointmentId: data.AppointmentId,
      ChiefComplaints: data.ChiefComplaints,
      PastHistory: data.PastHistory,
      Examination: data.Examination,
      Medicines: data.Medicines,
      Advice: data.Advice,
      Diagnosis: data.Diagnosis || ''
    };

    this.http.post(`https://localhost:7090/api/Appointments/save-prescription`, payload).subscribe({
      next: () => {
        this.successMessage = 'Prescription saved successfully!';
        this.showPrescriptionForm = false;
        this.selectedPrescriptionAppointmentId = null;
        this.loadAllAppointments();

        // AUTO SHOW INVOICE
        this.invoiceData = {
          patient: this.patientData,
          doctor: this.doctorData,
          medicines: data.Medicines,
          bill: data.Bill,
          chiefComplaints: data.ChiefComplaints,
          advice: data.Advice,
          date: new Date().toLocaleDateString()
        };

        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error saving prescription:', error);
        this.errorMessage = 'Failed to save prescription.';
      }
    });
  }

  cancelPrescription() {
    this.showPrescriptionForm = false;
    this.selectedPrescriptionAppointmentId = null;
    this.invoiceData = null; // Clear invoice on cancel
  }

  printInvoice() {
    if (!this.invoiceData) return;

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    const medicinesHtml = this.invoiceData.medicines
      .map((m: any) => `
        <tr>
          <td style="padding: 6px 0;">${m.Name}</td>
          <td style="text-align: center;">${m.Days} days</td>
          <td style="text-align: right; font-size: 0.9em;">
            (${m.MorningBefore}+${m.MorningAfter} | ${m.AfternoonBefore}+${m.AfternoonAfter} | ${m.NightBefore}+${m.NightAfter})
          </td>
        </tr>
      `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${this.invoiceData.patient.name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 15px; }
            .header h1 { margin: 0; color: #007bff; }
            .info { display: flex; justify-content: space-between; margin: 20px 0; font-size: 1em; }
            .info div { flex: 1; }
            .info .right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: none; padding: 8px 0; }
            .total { font-weight: bold; font-size: 1.1em; color: #007bff; }
            .bill-table { width: 100%; }
            .bill-table td { padding: 6px 0; }
            .bill-table .label { width: 70%; }
            .bill-table .value { text-align: right; }
            hr { border: none; border-top: 1px dashed #ccc; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SwasthaTech Hospital</h1>
            <p>Bellandur, Bengaluru - 560103 | +91 8888666623 | swasthatech@gmail.com</p>
          </div>

          <div class="info">
            <div>
              <p><strong>Patient:</strong> ${this.invoiceData.patient.name}</p>
              <p><strong>Age:</strong> ${this.invoiceData.patient.age}</p>
              <p><strong>Date:</strong> ${this.invoiceData.date}</p>
            </div>
            <div class="right">
              <p><strong>Doctor:</strong> ${this.invoiceData.doctor.name}</p>
              <p><strong>Specialization:</strong> ${this.invoiceData.doctor.info}</p>
            </div>
          </div>

          <hr>

          <h3 style="color: #007bff;">Medicines Prescribed</h3>
          <table>
            ${medicinesHtml}
          </table>

          <hr>

          <h3 style="color: #007bff;">Billing Summary</h3>
          <table class="bill-table">
            <tr><td class="label">Consultation Fee</td><td class="value">${this.invoiceData.bill.currency}${this.invoiceData.bill.consultationFee.toFixed(2)}</td></tr>
            <tr><td class="label">Medicine Cost</td><td class="value">${this.invoiceData.bill.currency}${this.invoiceData.bill.medicineCost.toFixed(2)}</td></tr>
            <tr><td class="label">GST (5%)</td><td class="value">${this.invoiceData.bill.currency}${this.invoiceData.bill.gst.toFixed(2)}</td></tr>
            <tr class="total"><td class="label">Total Amount</td><td class="value">${this.invoiceData.bill.currency}${this.invoiceData.bill.total.toFixed(2)}</td></tr>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 600);
  }

  formatDate(date: string): string {
    return date ? new Date(date).toLocaleString() : 'N/A';
  }
}