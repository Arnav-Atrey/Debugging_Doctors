import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService, AppointmentResponseDto } from '../../services/appointmentservices';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments-management',
  templateUrl: './appointments-management.html',
  styleUrls: ['./appointments-management.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class AppointmentsManagementComponent implements OnInit {
  appointments: AppointmentResponseDto[] = [];
  filteredAppointments: AppointmentResponseDto[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  statuses: string[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.getAllAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.filteredAppointments = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.errorMessage = 'Failed to load appointments.';
        this.isLoading = false;
      }
    });
  }

  getAllAppointments() {
    return this.appointmentService['http'].get<AppointmentResponseDto[]>(
      'https://localhost:7090/api/Appointments'
    );
  }

  filterAppointments(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesSearch = 
        appointment.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || appointment.appointmentStatus === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning';
      case 'Confirmed': return 'bg-success';
      case 'Completed': return 'bg-info';
      case 'Cancelled': return 'bg-secondary';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPaymentBadgeClass(status: string): string {
    switch (status) {
      case 'Paid': return 'bg-success';
      case 'Pending': return 'bg-warning text-dark';
      case 'Cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}