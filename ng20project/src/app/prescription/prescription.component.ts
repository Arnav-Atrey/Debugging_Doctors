import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import { MedicineService } from '../services/medicineservices';
import { ROBOTO_REG } from './roboto-reg';

interface MedicineDto {
  medicineID: number;
  name: string;
  pricePerTablet: number;
}

interface Medicine {
  slNo: number;
  medicineID: number;
  name: string;
  pricePerTablet: number;
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
  availableMedicines: MedicineDto[] = [];
  
  bill = {
    consultationFee: 500,
    medicineCost: 0,
    gst: 0,
    total: 0,
    currency: '₹'
  };

  constructor(private http: HttpClient, private medicineService: MedicineService) {}

  // Update ngOnInit to ensure proper loading sequence
ngOnInit(): void {
  console.log('PrescriptionComponent initialized with:', {
    appointmentId: this.appointmentId,
    doctorId: this.doctorId,
    patient: this.patient,
    doctor: this.doctor
  });

  // Ensure patient and doctor objects exist with all required properties
  this.patient = {
    name: this.patient?.name || 'N/A',
    age: this.patient?.age || 0,
    date: this.patient?.date ? new Date(this.patient.date) : null
  };
  
  this.doctor = {
    name: this.doctor?.name || 'N/A',
    info: this.doctor?.info || 'N/A'
  };

  console.log('Initialized patient:', this.patient);
  console.log('Initialized doctor:', this.doctor);

  if (this.appointmentId) {
    // Load medicines FIRST, then load prescription
    this.loadAvailableMedicines();
    
    if (this.doctorId) {
      // If doctorId provided, fetch complete data
      this.fetchDoctorData();
      this.fetchPatientData();
    }
    
    // Load prescription after a short delay to ensure medicines are loaded
    setTimeout(() => {
      this.loadPrescription();
    }, 800);
  } else {
    this.loadAvailableMedicines();
  }

  if (!this.medicines.length && this.availableMedicines.length > 0) {
    this.addMedicine();
  }
}

  fetchPatientData() {
    if (!this.appointmentId || !this.doctorId) {
      console.error('Cannot fetch patient data: missing appointmentId or doctorId');
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
        console.log('Patient data response:', data);
        this.patient = {
          name: data.fullName || this.patient.name || 'N/A',
          age: data.age || 0,
          date: data.appointmentDate ? new Date(data.appointmentDate) : this.patient.date
        };
        console.log('Updated patient data:', this.patient);
      },
      error: (err) => {
        console.error('Error fetching patient data:', err);
      }
    });
  }

  fetchDoctorData(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.doctorId) {
        console.log('No doctorId provided, using input doctor data');
        resolve();
        return;
      }

      this.http.get(`https://localhost:7090/api/Doctors/${this.doctorId}`).subscribe({
        next: (data: any) => {
          console.log('Doctor data response:', data);
          this.doctor = {
            name: data.fullName || data.FullName || this.doctor.name || 'N/A',
            info: data.specialisation || data.Specialisation || this.doctor.info || 'General'
          };
          console.log('Updated doctor data:', this.doctor);
          resolve();
        },
        error: (err) => {
          console.error('Error fetching doctor data:', err);
          resolve();
        }
      });
    });
  }

  private loadAvailableMedicines(): void {
    console.log('Loading all available medicines...');
    
    this.http.get<MedicineDto[]>('https://localhost:7090/api/Medicines/all').subscribe({
      next: (meds) => {
        console.log('Medicines loaded:', meds);
        this.availableMedicines = meds;
        if (!this.medicines.length || this.medicines.every(m => m.medicineID === 0)) {
          this.medicines = [];
          this.addMedicine();
        }
        this.calculateBill();
      },
      error: (err) => {
        console.error('Error loading available medicines:', err);
        this.availableMedicines = [];
      }
    });
  }

  // Replace the loadPrescription method in prescription.component.ts

loadPrescription() {
  if (!this.appointmentId) {
    console.error('Cannot load prescription: appointmentId is undefined');
    return;
  }

  this.http.get(`https://localhost:7090/api/Appointments/${this.appointmentId}/prescription`).subscribe({
    next: (prescription: any) => {
      console.log('Prescription data response:', prescription);
      this.chiefComplaints = prescription.chiefComplaints || '';
      this.pastHistory = prescription.pastHistory || '';
      this.examination = prescription.examination || '';
      this.advice = prescription.advice || '';

      // IMPORTANT: Wait for medicines to be loaded before mapping prescription medicines
      if (this.availableMedicines.length === 0) {
        // If medicines not loaded yet, wait and try again
        console.log('Waiting for available medicines to load...');
        setTimeout(() => this.loadPrescription(), 500);
        return;
      }

      // Map prescription medicines with proper medicineID binding
      this.medicines = prescription.medicines && prescription.medicines.length
        ? prescription.medicines.map((m: any, i: number) => {
            // Find the medicine in available medicines to ensure ID exists
            const availableMed = this.availableMedicines.find(
              am => am.medicineID === m.medicineID || am.name === m.name
            );
            
            console.log(`Mapping medicine ${m.name}:`, {
              prescriptionMedId: m.medicineID,
              foundInAvailable: !!availableMed,
              availableMedId: availableMed?.medicineID
            });

            return {
              slNo: m.slNo || i + 1,
              medicineID: availableMed?.medicineID || m.medicineID || 0,
              name: m.name || '',
              pricePerTablet: m.pricePerTablet || availableMed?.pricePerTablet || 0,
              morningBefore: m.morningBefore || 0,
              morningAfter: m.morningAfter || 0,
              afternoonBefore: m.afternoonBefore || 0,
              afternoonAfter: m.afternoonAfter || 0,
              nightBefore: m.nightBefore || 0,
              nightAfter: m.nightAfter || 0,
              days: m.days || 0
            };
          })
        : [];

      console.log('Mapped medicines:', this.medicines);

      // Load invoice amount from appointment
      this.http.get(`https://localhost:7090/api/Appointments/${this.appointmentId}`).subscribe({
        next: (appointment: any) => {
          console.log('Appointment data for invoice:', appointment);
          if (appointment.invoiceAmount) {
            this.calculateBill();
            this.bill.total = appointment.invoiceAmount;
            const subtotal = this.bill.total / 1.05;
            this.bill.gst = this.bill.total - subtotal;
            this.bill.consultationFee = subtotal - this.bill.medicineCost;
            console.log('Bill loaded from appointment:', this.bill);
          } else {
            this.calculateBill();
          }
        },
        error: (err) => {
          console.warn('Could not load appointment invoice:', err);
          this.calculateBill();
        }
      });

      this.isEditMode = false;
    },
    error: (err) => {
      console.warn('No prescription found:', err);
      this.chiefComplaints = '';
      this.pastHistory = '';
      this.examination = '';
      this.advice = '';
      this.medicines = [];
      this.isEditMode = true;
      if (this.availableMedicines.length > 0) {
        this.addMedicine();
      }
    }
  });
}

  addMedicine(): void {
    const first = this.availableMedicines[0];
    this.medicines.push({
      slNo: this.medicines.length + 1,
      medicineID: first?.medicineID || 0,
      name: first?.name || '',
      pricePerTablet: first?.pricePerTablet || 0,
      morningBefore: 0,
      morningAfter: 0,
      afternoonBefore: 0,
      afternoonAfter: 0,
      nightBefore: 0,
      nightAfter: 0,
      days: 0
    });
    this.calculateBill();
  }

  removeMedicine(index: number) {
    this.medicines.splice(index, 1);
    this.medicines.forEach((med, i) => (med.slNo = i + 1));
    this.calculateBill();
  }

  onMedicineChange(med: Medicine, event: any): void {
    const selectedId = Number(event.target.value);
    console.log('Selected Medicine ID:', selectedId);
    
    const selected = this.availableMedicines.find(m => m.medicineID === selectedId);
    console.log('Selected Medicine Object:', selected);
    
    if (selected) {
      med.medicineID = selected.medicineID;
      med.name = selected.name;
      med.pricePerTablet = selected.pricePerTablet;
      console.log('Updated medicine:', med);
      this.calculateBill();
    }
  }

  calculateBill(): void {
    this.bill.medicineCost = this.medicines.reduce((sum, m) => {
      const daily = m.morningBefore + m.morningAfter +
                    m.afternoonBefore + m.afternoonAfter +
                    m.nightBefore + m.nightAfter;
      return sum + (daily * m.days * m.pricePerTablet);
    }, 0);

    const subtotal = this.bill.consultationFee + this.bill.medicineCost;
    this.bill.gst = +(subtotal * 0.05).toFixed(2);
    this.bill.total = +(subtotal + this.bill.gst).toFixed(2);
    
    console.log('Bill calculated:', this.bill);
  }

  savePrescription() {
    this.calculateBill();
    
    const payload = {
      AppointmentId: this.appointmentId,
      ChiefComplaints: this.chiefComplaints,
      PastHistory: this.pastHistory,
      Examination: this.examination,
      Advice: this.advice,
      Diagnosis: this.chiefComplaints,
      InvoiceAmount: this.bill.total,
      Medicines: this.medicines.map(m => ({
        MedicineID: m.medicineID,
        Name: m.name,
        MorningBefore: m.morningBefore,
        MorningAfter: m.morningAfter,
        AfternoonBefore: m.afternoonBefore,
        AfternoonAfter: m.afternoonAfter,
        NightBefore: m.nightBefore,
        NightAfter: m.nightAfter,
        Days: m.days,
        PricePerTablet: m.pricePerTablet
      }))
    };

    console.log('Saving prescription with payload:', payload);

    this.http.post('https://localhost:7090/api/Prescriptions/save-with-completion', payload).subscribe({
      next: (response: any) => {
        console.log('Prescription saved successfully:', response);
        this.isEditMode = false;
        this.save.emit({ 
          success: true, 
          message: response.message || 'Prescription saved successfully!' 
        });
      },
      error: (err) => {
        console.error('Error saving prescription:', err);
        this.save.emit({ 
          success: false, 
          message: err.error?.message || 'Failed to save prescription' 
        });
      }
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.cancel.emit();
  }

  downloadPDF() {
    const doc = new jsPDF();
    doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REG);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    const formatRupees = (amount: number): string =>
      `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const logoUrl = 'https://i.postimg.cc/Jh6NpCt7/Copilot-20251007-094058.png';
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(18);
      doc.text('SwasthaTech Hospital', 105, 15, { align: 'center' });
      doc.addImage(img, 'PNG', 15, 8, 25, 15);
      doc.setFontSize(12);
      doc.text(this.doctor.name || 'N/A', 195, 12, { align: 'right' });
      doc.text(this.doctor.info || 'N/A', 195, 18, { align: 'right' });
      doc.setLineWidth(0.5);
      doc.line(15, 25, 195, 25);

      let y = 35;
      doc.setFont('helvetica', 'bold');
      doc.text('Patient:', 15, y);
      doc.text('Age:', 90, y);
      doc.text('Date:', 140, y);
      doc.setFont('Roboto', 'normal');
      doc.text(this.patient.name || 'N/A', 38, y);
      doc.text((this.patient.age || 0).toString() + ' years', 105, y);
      doc.text(this.patient.date ? this.patient.date.toDateString() : 'N/A', 155, y);

      y += 15;
      const addSection = (title: string, content: string) => {
        doc.setFont('helvetica', 'bold');
        doc.text(title, 15, y);
        doc.setFont('Roboto', 'normal');
        const lines = doc.splitTextToSize(content || 'N/A', 180);
        doc.text(lines, 15, y + 6);
        y += lines.length * 6 + 10;
      };
      
      addSection('Chief Complaints & History:', this.chiefComplaints);
      addSection('Past History:', this.pastHistory);
      addSection('Examination:', this.examination);

      if (this.medicines.length > 0 && this.medicines.some(m => m.name.trim() !== '')) {
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
          styles: { fontSize: 10, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.3 },
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.3 },
          bodyStyles: { textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.3 },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 50, halign: 'left' },
            2: { cellWidth: 15 }, 3: { cellWidth: 15 }, 4: { cellWidth: 15 },
            5: { cellWidth: 15 }, 6: { cellWidth: 15 }, 7: { cellWidth: 15 },
            8: { cellWidth: 20 }
          }
        });

        y = (doc as any).lastAutoTable.finalY + 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Advice & Follow-Up:', 15, y);
      doc.setFont('Roboto', 'normal');
      const adv = doc.splitTextToSize(this.advice || 'N/A', 180);
      doc.text(adv, 15, y + 6);
      y += adv.length * 6 + 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Bill Summary:', 15, y);
      y += 6;

      const billBody: RowInput[] = [
        ['Consultation Fee', formatRupees(this.bill.consultationFee)],
        ['Medicine Cost', formatRupees(this.bill.medicineCost)],
        ['Subtotal', formatRupees(this.bill.consultationFee + this.bill.medicineCost)],
        ['GST (5%)', formatRupees(this.bill.gst)],
        ['Total Amount', formatRupees(this.bill.total)]
      ];

      autoTable(doc, {
        startY: y,
        body: billBody,
        theme: 'striped',
        styles: { font: 'Roboto', fontSize: 11 },
        columnStyles: { 
          0: { fontStyle: 'bold', font: 'helvetica', cellWidth: 60 }, 
          1: { halign: 'right', font: 'Roboto' } 
        }
      });

      const footerY = 270;
      doc.setFont('helvetica', 'bold');
      doc.text(this.doctor.name || 'N/A', 105, footerY - 8, { align: 'center' });
      doc.setFont('Roboto', 'normal');
      doc.text(this.doctor.info || 'N/A', 105, footerY - 2, { align: 'center' });
      doc.line(15, footerY, 195, footerY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('SwasthaTech Hospital', 105, footerY + 8, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Bellandur, Bengaluru - 560103 | +91 8888666623 | swasthatech@gmail.com',
               105, footerY + 14, { align: 'center' });

      const name = (this.patient.name || 'prescription').replace(/\s+/g, '_');
      doc.save(`${name}_Prescription.pdf`);
    };
  }
}