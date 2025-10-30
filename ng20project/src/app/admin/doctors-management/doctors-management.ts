import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctorservices';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/authservices';

@Component({
  selector: 'app-doctors-management',
  templateUrl: './doctors-management.html',
  styleUrls: ['./doctors-management.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class DoctorsManagementComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchTerm: string = '';
  selectedSpecialization: string = '';
  specializations: string[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService  // <-- Inject AuthService here
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.filteredDoctors = data;
        this.extractSpecializations();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.errorMessage = 'Failed to load doctors.';
        this.isLoading = false;
      }
    });
  }

  extractSpecializations(): void {
    const specs = this.doctors.map(d => d.specialisation).filter(s => s);
    this.specializations = [...new Set(specs)];
  }

  filterDoctors(): void {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesSearch = 
        doctor.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.specialisation?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.hpid?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesSpec = !this.selectedSpecialization || doctor.specialisation === this.selectedSpecialization;
      
      return matchesSearch && matchesSpec;
    });
  }

    viewDoctorDetails(doctorId: number): void {
    const doctor = this.doctors.find(d => d.docId === doctorId);
    if (doctor) {
      const message = `
        Doctor Details:
        Name: ${doctor.fullName}
        Specialization: ${doctor.specialisation || 'N/A'}
        HPID: ${doctor.hpid || 'N/A'}
        Contact: ${doctor.contactNo || 'N/A'}
        Availability: ${doctor.availability || 'N/A'}
      `;
      alert(message);
    }
  }

  softDeleteDoctor(doctorId: number): void {
  if (!confirm('Are you sure you want to delete this doctor? This can be restored later.')) {
    return;
  }

  const user = this.authService.currentUserValue;
  const adminId = user?.adminId || 0;

  this.doctorService.softDeleteDoctor(doctorId, adminId).subscribe({
    next: () => {
      this.successMessage = 'Doctor deleted successfully!';
      // Remove from local array immediately
      this.doctors = this.doctors.filter(d => d.docId !== doctorId);
      this.filterDoctors();
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      console.error('Error deleting doctor:', error);
      this.errorMessage = 'Failed to delete doctor.';
    }
  });
}
}