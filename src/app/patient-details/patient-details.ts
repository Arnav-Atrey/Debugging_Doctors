import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/userservices';


@Component({
  selector: 'app-patient-details',
  standalone: false,
  templateUrl: './patient-details.html',
  styleUrl: './patient-details.css',
})
export class PatientDetails implements OnInit {
  patientDetailsForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  userId: number = 0;
  maxDate: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get userId from localStorage (stored during registration)
    const storedUserId = localStorage.getItem('registeredUserId');
    if (!storedUserId) {
      this.errorMessage = 'User session not found. Please register again.';
      setTimeout(() => this.router.navigate(['/register']), 2000);
      return;
    }
    this.userId = parseInt(storedUserId);

    // Set max date to today (user can't be born in the future)
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    this.patientDetailsForm = this.fb.group({
      prefix: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      contactNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      aadhaar_no: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]]
    });
  }

  onSubmit(): void {
    if (this.patientDetailsForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      // Mark all fields as touched to show validation errors
      Object.keys(this.patientDetailsForm.controls).forEach(key => {
        this.patientDetailsForm.get(key)?.markAsTouched();
      });
      return;
    }

    const patientDetails = this.patientDetailsForm.value;

    this.userService.addPatientDetails(this.userId, patientDetails).subscribe({
      next: (response) => {
        this.successMessage = 'Patient details saved successfully!';
        this.errorMessage = '';
        
        // Clear the stored userId
        localStorage.removeItem('registeredUserId');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.successMessage = '';
        if (error.status === 404) {
          this.errorMessage = 'User not found. Please register again.';
        } else if (error.status === 409) {
          this.errorMessage = 'Patient details already exist.';
        } else {
          this.errorMessage = error.error || 'Failed to save patient details. Please try again.';
        }
      }
    });
  }

  skipForNow(): void {
    localStorage.removeItem('registeredUserId');
    this.router.navigate(['/login']);
  }
}