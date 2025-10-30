import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

interface Medicine {
  slNo: number;
  name: string;
  morningBefore: number;
  morningAfter: number;
  afternoonBefore: number;
  afternoonAfter: number;
  nightBefore: number;
  nightAfter: number;
  days: number;
}

@Component({
  selector: 'app-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  @Input() appointmentId!: number;
  @Input() doctorId!: number;
  @Input() patient: any = { name: 'N/A', age: 0, date: null };
  @Input() doctor: any = { name: 'N/A', info: 'N/A' };
  @Input() mode: 'create' | 'view' = 'create'; // New input for mode
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode = true;
  chiefComplaints = '';
  pastHistory = '';
  examination = '';
  advice = '';
  invoiceAmount: number | null = null;
  medicines: Medicine[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.appointmentId) {
      if (this.mode === 'view') {
        this.isEditMode = false;
        this.loadPrescription();
      } else {
        this.loadPrescription(); // Try to load existing prescription
      }
      this.fetchPatientData();
      this.fetchDoctorData();
    }
    if (!this.medicines.length) {
      this.addMedicine();
    }
  }

  fetchPatientData() {
    if (!this.appointmentId || !this.doctorId) {
      console.error('Cannot fetch patient data: appointmentId or doctorId is undefined');
      return;
    }
    this.http.get(`https://localhost:7090/api/Appointments/patient-data`, {
      params: {
        appointmentId: this.appointmentId.toString(),
        doctorId: this.doctorId.toString(),
        userRole: 'Doctor'
      }
    }).subscribe({
      next: (data: any) => {
        this.patient = {
          name: data.fullName || 'N/A',
          age: data.age || 0,
          date: data.appointmentDate ? new Date(data.appointmentDate) : null,
          gender: data.gender || 'N/A',
          contactNo: data.contactNo || 'N/A'
        };
      },
      error: (err) => {
        console.error('Error fetching patient data:', err);
      }
    });
  }

  fetchDoctorData() {
    if (!this.doctorId) {
      console.error('Cannot fetch doctor data: doctorId is undefined');
      return;
    }
    this.http.get(`https://localhost:7090/api/Doctors/${this.doctorId}`).subscribe({
      next: (data: any) => {
        this.doctor = {
          name: data.fullName || 'N/A',
          info: data.specialisation || 'N/A',
          hpid: data.hpid || 'N/A'
        };
      },
      error: (err) => {
        console.error('Error fetching doctor data:', err);
      }
    });
  }

  loadPrescription() {
    if (!this.appointmentId) {
      return;
    }
    this.isLoading = true;
    this.http.get(`https://localhost:7090/api/Prescriptions/appointment/${this.appointmentId}`).subscribe({
      next: (prescription: any) => {
        this.chiefComplaints = prescription.chiefComplaints || '';
        this.pastHistory = prescription.pastHistory || '';
        this.examination = prescription.examination || '';
        this.advice = prescription.advice || '';
        this.medicines = prescription.medicines && prescription.medicines.length
          ? prescription.medicines.map((m: any, i: number) => ({
              slNo: m.slNo || i + 1,
              name: m.name || '',
              morningBefore: m.morningBefore || 0,
              morningAfter: m.morningAfter || 0,
              afternoonBefore: m.afternoonBefore || 0,
              afternoonAfter: m.afternoonAfter || 0,
              nightBefore: m.nightBefore || 0,
              nightAfter: m.nightAfter || 0,
              days: m.days || 0
            }))
          : [this.createEmptyMedicine()];
        
        if (this.mode === 'view') {
          this.isEditMode = false;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.warn('No prescription found, initializing empty form');
        if (this.mode === 'create') {
          this.isEditMode = true;
        }
        this.medicines = [this.createEmptyMedicine()];
        this.isLoading = false;
      }
    });
  }

  createEmptyMedicine(): Medicine {
    return {
      slNo: this.medicines.length + 1,
      name: '',
      morningBefore: 0,
      morningAfter: 0,
      afternoonBefore: 0,
      afternoonAfter: 0,
      nightBefore: 0,
      nightAfter: 0,
      days: 0
    };
  }

  addMedicine() {
    this.medicines.push(this.createEmptyMedicine());
  }

  removeMedicine(index: number) {
    this.medicines.splice(index, 1);
    this.medicines.forEach((med, i) => med.slNo = i + 1);
  }

  savePrescription() {
    // Validate invoice amount for create mode
    if (this.mode === 'create' && (!this.invoiceAmount || this.invoiceAmount <= 0)) {
      this.errorMessage = 'Please enter a valid invoice amount to complete the appointment.';
      return;
    }

    // Validate that at least one medicine is properly filled
    const validMedicines = this.medicines.filter(m => m.name && m.name.trim() !== '');
    if (validMedicines.length === 0) {
      this.errorMessage = 'Please add at least one medicine to the prescription.';
      return;
    }

    this.isEditMode = false;
    this.isLoading = true;
    this.errorMessage = '';

    const prescriptionData = {
      AppointmentId: this.appointmentId,
      ChiefComplaints: this.chiefComplaints || 'Not provided',
      PastHistory: this.pastHistory || 'Not provided',
      Examination: this.examination || 'Not provided',
      Medicines: this.medicines
        .filter(m => m.name && m.name.trim() !== '')
        .map(m => ({
          SlNo: m.slNo,
          Name: m.name,
          MorningBefore: m.morningBefore,
          MorningAfter: m.morningAfter,
          AfternoonBefore: m.afternoonBefore,
          AfternoonAfter: m.afternoonAfter,
          NightBefore: m.nightBefore,
          NightAfter: m.nightAfter,
          Days: m.days
        })),
      Advice: this.advice || 'Follow-up as needed',
      Diagnosis: this.chiefComplaints || 'Consultation provided',
      InvoiceAmount: this.invoiceAmount
    };

    const endpoint = this.mode === 'create' 
      ? 'https://localhost:7090/api/Prescriptions/save-with-completion'
      : 'https://localhost:7090/api/Prescriptions/save-with-completion'; // Same endpoint works for both

    this.http.post(endpoint, prescriptionData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.save.emit({ 
          success: true, 
          message: response.message,
          invoiceAmount: response.invoiceAmount 
        });
      },
      error: (err) => {
        console.error('Error saving prescription:', err);
        this.errorMessage = err.error?.message || 'Failed to save prescription. Please try again.';
        this.isLoading = false;
        this.isEditMode = true;
      }
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.cancel.emit();
  }

  enableEdit() {
    if (this.mode === 'view') {
      this.isEditMode = true;
    }
  }

  downloadPDF() {
    const doc = new jsPDF();
    const lineHeight = 7;
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SwasthaTech Hospital', 105, y, { align: 'center' });
    
    y += lineHeight + 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Bellandur, Bengaluru - 560103 | +91 8888666623', 105, y, { align: 'center' });
    
    y += lineHeight + 5;
    doc.line(20, y, 190, y);
    y += 10;

    // Doctor Info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dr. ${this.doctor.name || 'N/A'}`, 150, y, { align: 'right' });
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${this.doctor.info || 'N/A'}`, 150, y, { align: 'right' });
    doc.text(`HPID: ${this.doctor.hpid || 'N/A'}`, 150, y + 5, { align: 'right' });
    
    y += lineHeight + 8;

    // Patient Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient Name: `, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.patient.name || 'N/A'}`, 55, y);
    
    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.text(`Age/Gender: `, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.patient.age || 0} / ${this.patient.gender || 'N/A'}`, 50, y);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Date: `, 120, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.patient.date ? new Date(this.patient.date).toLocaleDateString() : 'N/A'}`, 140, y);
    
    y += lineHeight + 5;
    doc.line(20, y, 190, y);
    y += 10;

    // Chief Complaints
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Chief Complaints & History:', 20, y);
    y += lineHeight;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const complaintsLines = doc.splitTextToSize(this.chiefComplaints || 'N/A', 170);
    complaintsLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += lineHeight;
    });

    y += 5;

    // Past History
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Past History:', 20, y);
    y += lineHeight;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const historyLines = doc.splitTextToSize(this.pastHistory || 'N/A', 170);
    historyLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += lineHeight;
    });

    y += 5;

    // Examination
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Examination:', 20, y);
    y += lineHeight;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const examLines = doc.splitTextToSize(this.examination || 'N/A', 170);
    examLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += lineHeight;
    });

    y += 10;

    // Medicines Table
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Medicines Prescribed:', 20, y);
    y += lineHeight + 3;

    doc.setFontSize(8);
    doc.text('No.', 22, y);
    doc.text('Medicine Name', 32, y);
    doc.text('Morning', 90, y);
    doc.text('Afternoon', 120, y);
    doc.text('Night', 150, y);
    doc.text('Days', 175, y);
    
    y += 2;
    doc.line(20, y, 190, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    this.medicines.forEach((med, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}`, 22, y);
      const medName = doc.splitTextToSize(med.name || 'N/A', 55);
      doc.text(medName, 32, y);
      
      doc.text(`${med.morningBefore}-${med.morningAfter}`, 95, y);
      doc.text(`${med.afternoonBefore}-${med.afternoonAfter}`, 125, y);
      doc.text(`${med.nightBefore}-${med.nightAfter}`, 155, y);
      doc.text(`${med.days}`, 177, y);
      
      y += lineHeight * Math.max(1, medName.length);
    });

    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    // Advice
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Advice & Follow-Up:', 20, y);
    y += lineHeight;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const adviceLines = doc.splitTextToSize(this.advice || 'N/A', 170);
    adviceLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += lineHeight;
    });

    // Footer - Doctor Signature
    y = 260;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dr. ${this.doctor.name || 'N/A'}`, 150, y, { align: 'right' });
    y += lineHeight;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.doctor.info || 'N/A'}`, 150, y, { align: 'right' });

    // Footer - Hospital Info
    y = 280;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('SwasthaTech Hospital', 105, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text('Bellandur, Bengaluru - 560103 | +91 8888666623 | swasthatech@gmail.com', 105, y, { align: 'center' });

    doc.save(`prescription_${this.appointmentId}.pdf`);
  }
}