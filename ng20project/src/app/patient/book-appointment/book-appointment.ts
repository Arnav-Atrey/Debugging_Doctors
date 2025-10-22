import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointmentservices';
import { DoctorService, Doctor } from '../../services/doctorservices';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.html',
  styleUrls: ['./book-appointment.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class BookAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  doctorId: number = 0;
  doctor: Doctor | null = null;
  patientId: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  minDate: string = '';
  availableSlots: string[] = [];
  loadingSlots: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      symptoms: ['', Validators.required]
    });

    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.doctorId = Number(this.route.snapshot.paramMap.get('doctorId'));
    this.loadDoctor();
    this.loadPatientId();

    // Watch for date changes
    this.appointmentForm.get('appointmentDate')?.valueChanges.subscribe(date => {
      if (date) {
        this.loadAvailableSlots(date);
      }
    });
  }

  loadAvailableSlots(date: string): void {
    this.loadingSlots = true;
    this.availableSlots = [];
    this.appointmentForm.patchValue({ appointmentTime: '' });

    this.appointmentService.getAvailableSlots(this.doctorId, date).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.loadingSlots = false;
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        this.errorMessage = 'Failed to load available time slots.';
        this.loadingSlots = false;
      }
    });
  }

  loadDoctor(): void {
    this.doctorService.getDoctor(this.doctorId).subscribe({
      next: (data) => {
        this.doctor = data;
      },
      error: (error) => {
        console.error('Error loading doctor:', error);
        this.errorMessage = 'Failed to load doctor information.';
      }
    });
  }

  loadPatientId(): void {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    this.patientId = userData.patientId || 0;
    
    if (!this.patientId) {
      this.errorMessage = 'Patient information not found. Please complete your profile.';
    }
  } else {
    this.errorMessage = 'Please login to book an appointment.';
    this.router.navigate(['/login']);
  }
}

  onSubmit(): void {
  if (this.appointmentForm.invalid) {
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';
  this.isLoading = true;

  const formValue = this.appointmentForm.value;
  const appointmentDateTime = `${formValue.appointmentDate}T${formValue.appointmentTime}:00`;

  const bookingData = {
    patientId: this.patientId,
    doctorId: this.doctorId,
    appointmentDate: appointmentDateTime,
    symptoms: formValue.symptoms
  };

  // Debug logging
  console.log('Patient ID:', this.patientId);
  console.log('Doctor ID:', this.doctorId);
  console.log('Booking Data:', bookingData);
  console.log('User from localStorage:', localStorage.getItem('user'));

  this.appointmentService.bookAppointment(bookingData).subscribe({
    next: (response) => {
      console.log('Appointment booked:', response);
      this.successMessage = 'Appointment request sent successfully! Waiting for doctor confirmation.';
      this.isLoading = false;
      
      setTimeout(() => {
        this.router.navigate(['/patient/my-appointments']);
      }, 2000);
    },
    error: (error) => {
      console.error('Booking error:', error);
      console.error('Error details:', error.error);
      this.errorMessage = error.error?.message || 'Failed to book appointment. Please try again.';
      this.isLoading = false;
    }
  });
}
}