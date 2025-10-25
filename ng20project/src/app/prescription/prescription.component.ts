import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';

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

  const logoUrl = 'https://i.postimg.cc/Jh6NpCt7/Copilot-20251007-094058.png';
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    // === HEADER ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SwasthaTech Hospital', 105, 15, { align: 'center' });

    // Logo (left)
    doc.addImage(img, 'PNG', 15, 8, 25, 15);

    // Doctor info (right)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(this.doctor.name || 'N/A', 195, 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(this.doctor.info || 'N/A', 195, 18, { align: 'right' });

    // Horizontal line below header
    doc.setLineWidth(0.5);
    doc.line(15, 25, 195, 25);

    // === PATIENT DETAILS ===
    doc.setFontSize(11);
    let y = 35;

    doc.setFont('helvetica', 'bold');
    doc.text('Patient:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.patient.name || 'N/A', 38, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Age:', 90, y);
    doc.setFont('helvetica', 'normal');
    doc.text((this.patient.age || 0).toString(), 105, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 140, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.patient.date ? this.patient.date.toDateString() : 'N/A', 155, y);

    // === SECTIONS WITH SPACING ===
    y += 18;
    const sectionSpacing = 14; // Increased spacing

    const addSection = (title: string, content: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, y);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(content || 'N/A', 180);
      doc.text(splitText, 15, y + 6);
      y += splitText.length * 6 + sectionSpacing;
    };

    addSection('Chief Complaints & History:', this.chiefComplaints);
    addSection('Past History:', this.pastHistory);
    addSection('Examination:', this.examination);

    // === MEDICINES TABLE FULL WIDTH ===
    doc.setFont('helvetica', 'bold');
    doc.text('Medicines Prescribed:', 15, y);
    y += 6;

    const head: RowInput[] = [
      [
        'Sl. No',
        'Medicines',
        { content: 'Morning', colSpan: 2, styles: { halign: 'center' as const } },
        { content: 'Afternoon', colSpan: 2, styles: { halign: 'center' as const } },
        { content: 'Night', colSpan: 2, styles: { halign: 'center' as const } },
        'No. of Days'
      ],
      ['', '', 'Before Food', 'After Food', 'Before Food', 'After Food', 'Before Food', 'After Food', '']
    ];

    const body = this.medicines.map((med, index) => [
      index + 1,
      med.name || 'N/A',
      med.morningBefore || 0,
      med.morningAfter || 0,
      med.afternoonBefore || 0,
      med.afternoonAfter || 0,
      med.nightBefore || 0,
      med.nightAfter || 0,
      med.days || 0
    ]);

    autoTable(doc, {
      startY: y,
      head,
      body,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50, halign: 'left' }, // wider for medicine names
        2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 15 },
        8: { cellWidth: 20 }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // === ADVICE SECTION ===
    doc.setFont('helvetica', 'bold');
    doc.text('Advice & Follow-Up:', 15, finalY);
    doc.setFont('helvetica', 'normal');
    const adviceLines = doc.splitTextToSize(this.advice || 'N/A', 180);
    doc.text(adviceLines, 15, finalY + 6);

    // === FOOTER ===
const footerY = 270;

// Doctor name + specialization above the line
doc.setFont('helvetica', 'bold');
doc.text(this.doctor.name || 'N/A', 105, footerY - 8, { align: 'center' });
doc.setFont('helvetica', 'normal');
doc.text(this.doctor.info || 'N/A', 105, footerY - 2, { align: 'center' });

// Horizontal line
doc.setLineWidth(0.5);
doc.line(15, footerY, 195, footerY);

// Hospital name (bold, centered) below the line
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.text('SwasthaTech Hospital', 105, footerY + 8, { align: 'center' });

// Contact info below hospital name
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.text(
  'Bellandur, Bengaluru - 560103 | +91 8888666623 | swasthatech@gmail.com',
  105,
  footerY + 14,
  { align: 'center' }
);

// === SAVE PDF with patient name ===
const patientName = this.patient.name || 'prescription';
doc.save(`${patientName}.pdf`);
  };
}



}