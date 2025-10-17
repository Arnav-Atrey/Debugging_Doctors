import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/userservices';
import { CaptchaComponent } from '../captcha/captcha'; // Import CAPTCHA

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CaptchaComponent] // Add CaptchaComponent
})
export class UserLogin {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isCaptchaValid: boolean = false;
  
  @ViewChild(CaptchaComponent) captchaComponent!: CaptchaComponent;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pswdHash: ['', Validators.required]
    });
  }

  onCaptchaValidated(isValid: boolean): void {
    this.isCaptchaValid = isValid;
  }

  onSubmit(): void {
  if (this.loginForm.invalid) {
    return;
  }

  // Validate CAPTCHA before submitting
  this.captchaComponent.validateCaptcha();
  
  if (!this.isCaptchaValid) {
    this.errorMessage = 'Please complete the CAPTCHA verification.';
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';

  const loginData = this.loginForm.value;
  this.userService.login(loginData).subscribe({
    next: (response) => {
      console.log('Login successful:', response);
      this.successMessage = `Welcome! Logging you in...`;
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response));
      
      setTimeout(() => {
        // Redirect based on role from database
        switch (response.role) {
          case 'Doctor':
            this.router.navigate(['/doctor/dashboard']);
            break;
          case 'Patient':
            this.router.navigate(['/patient/doctors']);
            break;
          case 'Admin':
            this.router.navigate(['/admin/dashboard']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      }, 1500);
    },
    error: (error) => {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.status === 404) {
        this.errorMessage = error.error?.message || 'This email is not registered. Please register first.';
      } else if (error.status === 401) {
        this.errorMessage = error.error?.message || 'Invalid password. Please try again.';
      } else {
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
      
      this.isCaptchaValid = false;
      this.captchaComponent.refreshCaptcha();
    }
  });
}
}