import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorService, Doctor } from '../../services/doctorservices';
import { PatientService, PatientListDto } from '../../services/patientservices';
import { AuthService } from '../../services/authservices';

@Component({
  selector: 'app-deleted-records',
  templateUrl: './deleted-records.html',
  styleUrls: ['./deleted-records.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DeletedRecordsComponent implements OnInit {
  activeTab: string = 'doctors';
  deletedDoctors: Doctor[] = [];
  deletedPatients: PatientListDto[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  currentAdminId: number = 0;

  constructor(
    private doctorService: DoctorService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.currentAdminId = user?.adminId || 0;
    this.loadDeletedRecords();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.loadDeletedRecords();
  }

  loadDeletedRecords(): void {
    this.isLoading = true;

    if (this.activeTab === 'doctors') {
      this.doctorService.getDeletedDoctors().subscribe({
        next: (data) => {
          this.deletedDoctors = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading deleted doctors:', error);
          this.errorMessage = 'Failed to load deleted doctors.';
          this.isLoading = false;
        }
      });
    } else if (this.activeTab === 'patients') {
      this.patientService.getDeletedPatients().subscribe({
        next: (data) => {
          this.deletedPatients = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading deleted patients:', error);
          this.errorMessage = 'Failed to load deleted patients.';
          this.isLoading = false;
        }
      });
    }
  }

  restoreDoctor(doctorId: number): void {
    if (!confirm('Are you sure you want to restore this doctor?')) {
      return;
    }

    this.doctorService.restoreDoctor(doctorId, this.currentAdminId).subscribe({
      next: () => {
        this.successMessage = 'Doctor restored successfully!';
        this.loadDeletedRecords();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error restoring doctor:', error);
        this.errorMessage = 'Failed to restore doctor.';
      }
    });
  }

  restorePatient(patientId: number): void {
    if (!confirm('Are you sure you want to restore this patient?')) {
      return;
    }

    this.patientService.restorePatient(patientId, this.currentAdminId).subscribe({
      next: () => {
        this.successMessage = 'Patient restored successfully!';
        this.loadDeletedRecords();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error restoring patient:', error);
        this.errorMessage = 'Failed to restore patient.';
      }
    });
  }

  permanentDeleteDoctor(doctorId: number): void {
    const message = `⚠️ WARNING: This will PERMANENTLY delete the doctor and ALL associated data including:
    
    • All appointments with this doctor
    • All prescriptions from these appointments
    • The doctor's user account
    
    This action CANNOT be undone!
    
    Are you absolutely sure you want to proceed?`;
    
    if (!confirm(message)) {
      return;
    }

    // Set loading state for this specific doctor
    const doctorIndex = this.deletedDoctors.findIndex(d => d.docId === doctorId);
    if (doctorIndex === -1) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.doctorService.permanentDeleteDoctor(doctorId).subscribe({
      next: () => {
        // Remove from array immediately - this will hide the card
        this.deletedDoctors = this.deletedDoctors.filter(d => d.docId !== doctorId);
        
        this.successMessage = 'Doctor and all related records permanently deleted from database.';
        this.isLoading = false;
        
        console.log('Doctor permanently deleted. Remaining deleted doctors:', this.deletedDoctors.length);
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error permanently deleting doctor:', error);
        console.error('Error details:', error.error);
        this.errorMessage = error.error?.message || error.error?.title || 'Failed to permanently delete doctor.';
        this.isLoading = false;
      }
    });
  }

  permanentDeletePatient(patientId: number): void {
    const message = `⚠️ WARNING: This will PERMANENTLY delete the patient and ALL associated data including:
    
    • All appointments with this patient
    • All prescriptions from these appointments
    • The patient's user account
    
    This action CANNOT be undone!
    
    Are you absolutely sure you want to proceed?`;
    
    if (!confirm(message)) {
      return;
    }

    // Set loading state for this specific patient
    const patientIndex = this.deletedPatients.findIndex(p => p.patientId === patientId);
    if (patientIndex === -1) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.patientService.permanentDeletePatient(patientId).subscribe({
      next: () => {
        // Remove from array immediately - this will hide the card
        this.deletedPatients = this.deletedPatients.filter(p => p.patientId !== patientId);
        
        this.successMessage = 'Patient and all related records permanently deleted from database.';
        this.isLoading = false;
        
        console.log('Patient permanently deleted. Remaining deleted patients:', this.deletedPatients.length);
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error permanently deleting patient:', error);
        console.error('Error details:', error.error);
        this.errorMessage = error.error?.message || error.error?.title || 'Failed to permanently delete patient.';
        this.isLoading = false;
      }
    });
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }
}