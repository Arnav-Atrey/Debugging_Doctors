import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface PatientListDto {
  patientId: number;
  userId: number;
  fullName: string;
  email: string;
  dob?: string;
  gender?: string;
  contactNo?: string;
  address?: string;
  aadhaarNo?: string;
}

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    
    // Get all patients with their user info
    this.http.get<any[]>('https://localhost:7090/api/Patients').subscribe({
      next: (patients) => {
        // Get all users to map email
        this.http.get<any[]>('https://localhost:7090/api/Users').subscribe({
          next: (users) => {
            this.patients = patients.map(patient => {
              const user = users.find(u => u.userId === patient.userId);
              return {
                ...patient,
                email: user?.email || 'N/A'
              };
            });
            this.filteredPatients = this.patients;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading users:', error);
            this.patients = patients;
            this.filteredPatients = patients;
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.errorMessage = 'Failed to load patients.';
        this.isLoading = false;
      }
    });
  }

  filterPatients(): void {
    this.filteredPatients = this.patients.filter(patient => {
      return patient.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             patient.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             patient.aadhaarNo?.includes(this.searchTerm) ||
             patient.contactNo?.includes(this.searchTerm);
    });
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
}