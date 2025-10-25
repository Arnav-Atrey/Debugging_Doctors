import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctorservices';
import { FormsModule } from '@angular/forms';

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

  constructor(private doctorService: DoctorService) {}

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
    // Navigate to doctor details or open modal
    console.log('View doctor details:', doctorId);
  }
}