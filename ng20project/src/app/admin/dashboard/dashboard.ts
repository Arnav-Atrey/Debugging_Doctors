import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStatsDto } from '../../services/adminservices';
import { DoctorService } from '../../services/doctorservices';
import { PatientService } from '../../services/patientservices';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStatsDto | null = null;
  deletedRecordsCount: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private adminService: AdminService,
    private doctorService: DoctorService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadDeletedRecordsCount();
  }

  loadDeletedRecordsCount(): void {
    forkJoin({
      doctors: this.doctorService.getDeletedDoctors(),
      patients: this.patientService.getDeletedPatients()
    }).subscribe({
      next: ({ doctors, patients }) => {
        this.deletedRecordsCount = doctors.length + patients.length;
      },
      error: (error) => {
        console.error('Error loading deleted records count:', error);
      }
    });
  }

  loadStats(): void {
    this.isLoading = true;
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.errorMessage = 'Failed to load statistics.';
        this.isLoading = false;
      }
    });
  }
}