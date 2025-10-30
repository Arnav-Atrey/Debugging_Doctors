import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PatientListDto, PatientService } from '../../services/patientservices';
import { AuthService } from '../../services/authservices';

// export interface PatientListDto {
//   patientId: number;
//   userId: number;
//   fullName: string;
//   email: string;
//   dob?: string;
//   gender?: string;
//   contactNo?: string;
//   address?: string;
//   aadhaarNo?: string;
// }

@Component({
  selector: 'app-patients-management',
  templateUrl: './patients-management.html',
  styleUrls: ['./patients-management.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class PatientsManagementComponent implements OnInit {
  patients: PatientListDto[] = [];
  filteredPatients: PatientListDto[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = ''; // <-- Added missing property

  constructor(
    private http: HttpClient,
    private patientService: PatientService, // <-- Inject PatientService
    private authService: AuthService        // <-- Inject AuthService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;

    // Use the PatientService to get the list endpoint which has all data
    this.http.get<any[]>('https://localhost:7090/api/Patients/list').subscribe({
      next: (patients) => {
        this.patients = patients.map(patient => ({
          patientId: patient.patientId,
          userId: patient.userId,
          fullName: patient.fullName,
          email: patient.email,
          dob: patient.dob,
          age: patient.age,
          gender: patient.gender,
          contactNo: patient.contactNo,
          address: patient.address,
          aadhaarNo: patient.aadhaar_no || patient.aadhaarNo,
          createdAt: patient.createdAt
        }));
        this.filteredPatients = this.patients;
        this.isLoading = false;
        console.log('Loaded patients:', this.patients);
      },
      error: (error: any) => {
        console.error('Error loading patients:', error);
        this.errorMessage = 'Failed to load patients.';
        this.isLoading = false;
      }
    });
  }

  filterPatients(): void {
    this.filteredPatients = this.patients.filter(patient => {
      const search = this.searchTerm.toLowerCase();
      return (
        patient.fullName.toLowerCase().includes(search) ||
        (patient.email && patient.email.toLowerCase().includes(search)) ||
        (patient.aadhaarNo && patient.aadhaarNo.includes(this.searchTerm)) ||
        (patient.contactNo && patient.contactNo.includes(this.searchTerm))
      );
    });
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  calculateAge(dob?: string): number {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  viewPatientDetails(patientId: number): void {
    const patient = this.patients.find(p => p.patientId === patientId);
    if (patient) {
      const dobDisplay = patient.dob ? this.formatDate(patient.dob) : 'N/A';
      const age = patient.dob ? this.calculateAge(patient.dob) : (patient['age'] ?? 'N/A');
      const message = `
        Patient Details:
        Name: ${patient.fullName}
        Email: ${patient.email || 'N/A'}
        DOB: ${dobDisplay}
        Age: ${age}
        Gender: ${patient.gender || 'N/A'}
        Contact: ${patient.contactNo || 'N/A'}
        Address: ${patient.address || 'N/A'}
        Aadhaar: ${patient.aadhaarNo || 'N/A'}
      `;
      alert(message);
    } else {
      alert('Patient not found.');
    }
  }

  softDeletePatient(patientId: number): void {
    if (!confirm('Are you sure you want to delete this patient? This can be restored later.')) {
      return;
    }

    const user = this.authService.currentUserValue;
    const adminId = user?.adminId || 0;

    this.patientService.softDeletePatient(patientId, adminId).subscribe({
      next: () => {
        this.successMessage = 'Patient deleted successfully!';
        this.loadPatients();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => { // <-- Explicit type
        console.error('Error deleting patient:', error);
        this.errorMessage = 'Failed to delete patient.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}