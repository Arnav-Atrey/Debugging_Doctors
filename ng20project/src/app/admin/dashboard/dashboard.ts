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
    console.log('Loading deleted records count...');
    
    forkJoin({
      doctors: this.doctorService.getDeletedDoctors(),
      patients: this.patientService.getDeletedPatients()
    }).subscribe({
      next: ({ doctors, patients }) => {
        const doctorsCount = doctors?.length || 0;
        const patientsCount = patients?.length || 0;
        this.deletedRecordsCount = doctorsCount + patientsCount;
        
        console.log('Deleted doctors:', doctorsCount);
        console.log('Deleted patients:', patientsCount);
        console.log('Total deleted records count:', this.deletedRecordsCount);
      },
      error: (error) => {
        console.error('Error loading deleted records count:', error);
        console.error('Error details:', error.error);
        
        // Try to get counts individually if forkJoin fails
        this.loadDeletedCountsIndividually();
      }
    });
  }

  private loadDeletedCountsIndividually(): void {
    let doctorsCount = 0;
    let patientsCount = 0;
    let completedCalls = 0;

    this.doctorService.getDeletedDoctors().subscribe({
      next: (doctors) => {
        doctorsCount = doctors?.length || 0;
        completedCalls++;
        if (completedCalls === 2) {
          this.deletedRecordsCount = doctorsCount + patientsCount;
          console.log('Total deleted records (individual):', this.deletedRecordsCount);
        }
      },
      error: (err) => {
        console.error('Error loading deleted doctors:', err);
        completedCalls++;
        if (completedCalls === 2) {
          this.deletedRecordsCount = doctorsCount + patientsCount;
        }
      }
    });

    this.patientService.getDeletedPatients().subscribe({
      next: (patients) => {
        patientsCount = patients?.length || 0;
        completedCalls++;
        if (completedCalls === 2) {
          this.deletedRecordsCount = doctorsCount + patientsCount;
          console.log('Total deleted records (individual):', this.deletedRecordsCount);
        }
      },
      error: (err) => {
        console.error('Error loading deleted patients:', err);
        completedCalls++;
        if (completedCalls === 2) {
          this.deletedRecordsCount = doctorsCount + patientsCount;
        }
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