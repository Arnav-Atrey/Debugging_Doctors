import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppointmentService, TimeSlot } from '../../services/appointmentservices';
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
  maxDate: string = '';
  timeSlots: TimeSlot[] = [];
  loadingSlots: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {
    this.appointmentForm = this.fb.group({
      appointmentDate: ['', [Validators.required, this.futureDateValidator]],
      appointmentTime: ['', Validators.required],
      symptoms: ['', Validators.required]
    });

    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Set maximum date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    this.maxDate = maxDate.toISOString().split('T')[0];
  }

  // Custom validator to ensure date is not in the past
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    
    if (selectedDate < today) {
      return { pastDate: true };
    }
    
    return null;
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
    this.timeSlots = [];
    this.appointmentForm.patchValue({ appointmentTime: '' });

    this.appointmentService.getAvailableSlots(this.doctorId, date).subscribe({
      next: (slots) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = selectedDate.toDateString() === today.toDateString();

        this.timeSlots = slots.map(slot => {
          if (isToday) {
            // Check if the slot time is in the past
            const [hours, minutes] = slot.time.split(':').map(Number);
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hours, minutes, 0, 0);
            const now = new Date();
            return { ...slot, available: slot.available && slotDateTime > now };
          }
          return slot;
        });

        this.loadingSlots = false;
      },
      error: (error) => {
        console.error('Error loading slots:', error);
        this.errorMessage = 'Failed to load available time slots.';
        this.loadingSlots = false;
      }
    });
  }

  isSlotAvailable(time: string): boolean {
    const slot = this.timeSlots.find(s => s.time === time);
    return slot ? slot.available : false;
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