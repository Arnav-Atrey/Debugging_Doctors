// src/app/invoice/invoice.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import jsPDF from 'jspdf';
import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
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

interface Bill {
  consultationFee: number;
  medicineCost: number;
  gst: number;
  total: number;
  currency: string;
}

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [DecimalPipe, DatePipe, CommonModule],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css']
})
export class InvoiceComponent implements OnChanges {
  @Input() patient: any = { name: 'N/A', age: 0, date: null };
  @Input() doctor: any = { name: 'N/A', info: 'N/A' };
  @Input() medicines: Medicine[] = [];
  @Input() bill!: Bill;
  @Input() chiefComplaints = '';
  @Input() advice = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Optional: recalculate if needed
  }

  // Helper: calculate daily dose
  dailyDose(m: Medicine): number {
    return m.morningBefore + m.morningAfter +
           m.afternoonBefore + m.afternoonAfter +
           m.nightBefore + m.nightAfter;
  }

  // Helper: total cost for a medicine
  medicineTotal(m: Medicine): number {
    return this.dailyDose(m) * m.days * m.pricePerTablet;
  }

  // Download PDF
  downloadPDF(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 20;

    // === HEADER ===
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(16);
    doc.text('SwasthaTech Hospital', 105, y, { align: 'center' });
    y += 12;

    // === PATIENT & DOCTOR INFO ===
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient: ${this.patient.name || 'N/A'}`, 20, y);
    doc.text(`Doctor: ${this.doctor.name || 'N/A'} - ${this.doctor.info || 'N/A'}`, 105, y);
    y += 8;
    doc.text(`Age: ${this.patient.age || 0} | Date: ${this.formatDate(this.patient.date)}`, 20, y);
    y += 15;

    // === MEDICINES TABLE ===
    doc.setFontSize(12);
    doc.text('Prescribed Medicines', 20, y);
    y += 8;

    const headers = ['#', 'Medicine', 'M', 'A', 'N', 'Days', '₹/Tab', 'Total'];
    const colWidths = [10, 60, 15, 15, 15, 15, 20, 25];
    let x = 20;

    // Header
    doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => {
      doc.text(h, x, y);
      x += colWidths[i];
    });
    y += 6;
    doc.setFont('helvetica', 'normal');

    // Rows
    this.medicines.forEach(m => {
      x = 20;
      const dose = `${m.morningBefore}/${m.morningAfter}`;
      const aft = `${m.afternoonBefore}/${m.afternoonAfter}`;
      const night = `${m.nightBefore}/${m.nightAfter}`;
      const total = this.medicineTotal(m).toFixed(2);

      const row = [
        m.slNo.toString(),
        this.truncate(m.name, 25),
        dose,
        aft,
        night,
        m.days.toString(),
        m.pricePerTablet.toFixed(2),
        total
      ];

      row.forEach((cell, i) => {
        doc.text(cell, x, y);
        x += colWidths[i];
      });
      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;

    // === BILLING SUMMARY ===
    doc.setFontSize(12);
    doc.text('Billing Summary', 20, y); y += 10;

    doc.setFontSize(11);
    doc.text(`Consultation Fee (${this.doctor.info}):`, 25, y);
    doc.text(`${this.bill.currency}${this.bill.consultationFee.toFixed(2)}`, 160, y, { align: 'right' });
    y += 7;

    doc.text(`Medicine Cost:`, 25, y);
    doc.text(`${this.bill.currency}${this.bill.medicineCost.toFixed(2)}`, 160, y, { align: 'right' });
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text(`GST (5%):`, 25, y);
    doc.text(`${this.bill.currency}${this.bill.gst.toFixed(2)}`, 160, y, { align: 'right' });
    y += 10;

    doc.setFontSize(14);
    doc.text(`GRAND TOTAL:`, 25, y);
    doc.text(`${this.bill.currency}${this.bill.total.toFixed(2)}`, 160, y, { align: 'right' });
    y += 20;

    // === FOOTER ===
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Bellandur, Bengaluru - 560103 | +91 8888666623 | swasthatech@gmail.com', 105, 280, { align: 'center' });

    // Save
    const fileName = `Invoice_${this.patient.name || 'Patient'}_${this.formatDate(this.patient.date, true)}.pdf`;
    doc.save(fileName);
  }

  // Helpers
  private formatDate(date: any, forFile = false): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return forFile
      ? d.toISOString().slice(0, 10)
      : d.toLocaleDateString('en-IN');
  }

  private truncate(str: string, len: number): string {
    return str.length > len ? str.substring(0, len - 3) + '...' : str;
  }
}