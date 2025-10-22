import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DoctorService, Doctor } from '../../services/doctorservices';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.html',
  styleUrls: ['./doctor-list.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchTerm: string = '';
  selectedSpecialization: string = '';
  specializations: string[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private doctorService: DoctorService,
    private router: Router
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
        this.errorMessage = 'Failed to load doctors. Please try again.';
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
      const matchesSearch = doctor.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           doctor.specialisation?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSpec = !this.selectedSpecialization || doctor.specialisation === this.selectedSpecialization;
      return matchesSearch && matchesSpec;
    });
  }

  bookAppointment(doctorId: number): void {
    this.router.navigate(['/patient/book-appointment', doctorId]);
  }
}