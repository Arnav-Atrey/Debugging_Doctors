import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/userservices';
import { CommonModule } from '@angular/common';

// Custom HPID validator
function hpidValidator(control: any) {
  const value = control.value;
  if (!/^\d{14}$/.test(value)) {
    return { hpidFormat: true };
  }
  const datePart = value.substring(0, 8);
  const year = parseInt(datePart.substring(0, 4), 10);
  const month = parseInt(datePart.substring(4, 6), 10);
  const day = parseInt(datePart.substring(6, 8), 10);

  // Basic date validation
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return { hpidDate: true };
  }
  return null;
}

// Custom noNumbers validator
function noNumbersValidator(control: any) {
  const value = control.value;
  if (/\d/.test(value)) {
    return { noNumbers: true };
  }
  return null;
}

@Component({
  selector: 'app-doctor-details',
  templateUrl: './doctor-details.html',
  styleUrls: ['./doctor-details.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class DoctorDetails implements OnInit {
  doctorDetailsForm!: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  userId: number = 0;

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

    this.doctorDetailsForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), noNumbersValidator]],
      specialisation: ['', [Validators.required]],
      hpid: ['', [Validators.required, hpidValidator]],
      contactNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  onSubmit(): void {
    if (this.doctorDetailsForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    const doctorDetails = this.doctorDetailsForm.value;

    this.userService.addDoctorDetails(this.userId, doctorDetails).subscribe({
      next: (response) => {
        this.successMessage = 'Doctor details saved successfully!';
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
          this.errorMessage = 'Doctor details already exist.';
        } else {
          this.errorMessage = error.error || 'Failed to save doctor details. Please try again.';
        }
      }
    });
  }

  skipForNow(): void {
    localStorage.removeItem('registeredUserId');
    this.router.navigate(['/login']);
  }
}