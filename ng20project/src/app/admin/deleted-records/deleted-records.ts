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
    if (!confirm('WARNING: This will PERMANENTLY delete the doctor. This action cannot be undone. Are you sure?')) {
      return;
    }

    this.isLoading = true;
    this.doctorService.permanentDeleteDoctor(doctorId).subscribe({
      next: () => {
        this.successMessage = 'Doctor permanently deleted.';
        this.isLoading = false;
        // Remove from local array immediately for UI update
        this.deletedDoctors = this.deletedDoctors.filter(d => d.docId !== doctorId);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error permanently deleting doctor:', error);
        this.errorMessage = 'Failed to permanently delete doctor.';
        this.isLoading = false;
      }
    });
  }

  permanentDeletePatient(patientId: number): void {
    if (!confirm('WARNING: This will PERMANENTLY delete the patient. This action cannot be undone. Are you sure?')) {
      return;
    }

    this.isLoading = true;
    this.patientService.permanentDeletePatient(patientId).subscribe({
      next: () => {
        this.successMessage = 'Patient permanently deleted.';
        this.isLoading = false;
        // Remove from local array immediately for UI update
        this.deletedPatients = this.deletedPatients.filter(p => p.patientId !== patientId);
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error permanently deleting patient:', error);
        this.errorMessage = 'Failed to permanently delete patient.';
        this.isLoading = false;
      }
    });
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }
}