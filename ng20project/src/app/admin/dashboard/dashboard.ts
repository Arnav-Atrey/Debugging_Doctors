import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AdminService, AdminStatsDto } from '../../services/adminservices';
import { DoctorService } from '../../services/doctorservices';
import { PatientService } from '../../services/patientservices';
import { forkJoin, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: AdminStatsDto | null = null;
  deletedRecordsCount: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  private routerSubscription?: Subscription;

  constructor(
    private adminService: AdminService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadDeletedRecordsCount();
    
    // Reload counts when navigating back to dashboard
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/admin/dashboard') {
        this.loadDeletedRecordsCount();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadDeletedRecordsCount(): void {
    forkJoin({
      doctors: this.doctorService.getDeletedDoctors(),
      patients: this.patientService.getDeletedPatients()
    }).subscribe({
      next: ({ doctors, patients }) => {
        this.deletedRecordsCount = doctors.length + patients.length;
        console.log('Deleted records count updated:', this.deletedRecordsCount);
      },
      error: (error) => {
        console.error('Error loading deleted records count:', error);
        this.deletedRecordsCount = 0;
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