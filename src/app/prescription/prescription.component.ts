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
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  isEditMode = true;
  chiefComplaints = '';
  pastHistory = '';
  examination = '';
  advice = '';
  medicines: Medicine[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.appointmentId) {
      this.loadPrescription();
      this.fetchPatientData();
      this.fetchDoctorData();
    } else {
      console.error('Appointment ID is undefined');
      this.patient = {
        name: this.patient.name || 'N/A',
        age: this.patient.age || 0,
        date: this.patient.date ? new Date(this.patient.date) : null
      };
      this.doctor = { name: 'N/A', info: 'N/A' };
    }
    if (!this.medicines.length) {
      this.addMedicine();
    }
  }

  fetchPatientData() {
  if (!this.appointmentId || !this.doctorId) {
    console.error('Cannot fetch patient data: appointmentId or doctorId is undefined', {
      appointmentId: this.appointmentId,
      doctorId: this.doctorId
    });
    return;
  }
  this.http.get(`https://localhost:7090/api/Appointments/patient-data`, {
  params: {
    appointmentId: this.appointmentId.toString(),
    doctorId: this.doctorId.toString(),  // Changed from userId
    userRole: 'Doctor'
  }
}).subscribe({
    next: (data: any) => {
      console.log('Patient data response:', data);
      this.patient = {
        name: data.fullName || 'N/A',
        age: data.age || 0,
        date: data.appointmentDate ? new Date(data.appointmentDate) : null
      };
      console.log('Updated patient data:', this.patient);
    },
    error: (err) => {
      console.error('Error fetching patient data:', err);
      this.patient = {
        name: this.patient.name || 'N/A',
        age: 0,
        date: this.patient.date ? new Date(this.patient.date) : null
      };
      console.log('Fallback patient data:', this.patient);
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
        console.log('Doctor data response:', data);
        this.doctor = {
          name: data.fullName || data.FullName || 'N/A',
          info: data.specialisation || data.Specialisation || 'N/A'
        };
        console.log('Updated doctor data:', this.doctor);
      },
      error: (err) => {
        console.error('Error fetching doctor data:', err);
        this.doctor = { name: 'N/A', info: 'N/A' };
        console.log('Fallback doctor data:', this.doctor);
      }
    });
  }

  loadPrescription() {
    if (!this.appointmentId) {
      console.error('Cannot load prescription: appointmentId is undefined');
      return;
    }
    this.http.get(`https://localhost:7090/api/Appointments/${this.appointmentId}/prescription`).subscribe({
      next: (prescription: any) => {
        console.log('Prescription data response:', prescription);
        this.chiefComplaints = prescription.ChiefComplaints || '';
        this.pastHistory = prescription.PastHistory || '';
        this.examination = prescription.Examination || '';
        this.advice = prescription.Advice || '';
        this.medicines = prescription.Medicines && prescription.Medicines.length
          ? prescription.Medicines.map((m: any, i: number) => ({
              slNo: m.SlNo || i + 1,
              name: m.Name || '',
              morningBefore: m.MorningBefore || 0,
              morningAfter: m.MorningAfter || 0,
              afternoonBefore: m.AfternoonBefore || 0,
              afternoonAfter: m.AfternoonAfter || 0,
              nightBefore: m.NightBefore || 0,
              nightAfter: m.NightAfter || 0,
              days: m.Days || 0
            }))
          : [this.createEmptyMedicine()];
        this.isEditMode = false;
      },
      error: (err) => {
        console.warn('No prescription found for this appointment, initializing empty form:', err);
        this.chiefComplaints = '';
        this.pastHistory = '';
        this.examination = '';
        this.advice = '';
        this.medicines = [this.createEmptyMedicine()];
        this.isEditMode = true;
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
    this.isEditMode = false;
    this.save.emit({
      AppointmentId: this.appointmentId,
      ChiefComplaints: this.chiefComplaints,
      PastHistory: this.pastHistory,
      Examination: this.examination,
      Medicines: this.medicines.map(m => ({
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
      Advice: this.advice,
      Diagnosis: ''
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.cancel.emit();
  }

  downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('SwasthaTech Hospital', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Doctor: ${this.doctor.name || 'N/A'} - ${this.doctor.info || 'N/A'}`, 150, 30, { align: 'right' });
    doc.text(`Patient: ${this.patient.name || 'N/A'}`, 20, 50);
    doc.text(`Age: ${this.patient.age || 0}`, 20, 60);
    doc.text(`Date: ${this.patient.date ? this.patient.date.toDateString() : 'N/A'}`, 20, 70);
    doc.text('Chief Complaints & History:', 20, 80);
    doc.text(this.chiefComplaints || 'N/A', 20, 90);
    doc.text('Past History:', 20, 100);
    doc.text(this.pastHistory || 'N/A', 20, 110);
    doc.text('Examination:', 20, 120);
    doc.text(this.examination || 'N/A', 20, 130);
    doc.text('Medicines Prescribed:', 20, 140);
    let y = 150;
    this.medicines.forEach(med => {
      doc.text(`${med.slNo}. ${med.name || 'N/A'} - Morning: ${med.morningBefore}/${med.morningAfter}, Afternoon: ${med.afternoonBefore}/${med.afternoonAfter}, Night: ${med.nightBefore}/${med.nightAfter}, Days: ${med.days}`, 20, y);
      y += 10;
    });
    doc.text('Advice & Follow-Up:', 20, y + 10);
    doc.text(this.advice || 'N/A', 20, y + 20);
    doc.text(`Doctor: ${this.doctor.name || 'N/A'}`, 150, y + 40, { align: 'right' });
    doc.text('Bellandur, Bengaluru - 560103 | +91 8888666623 | swasthatech@gmail.com', 105, 280, { align: 'center' });
    doc.save('prescription.pdf');
  }
}