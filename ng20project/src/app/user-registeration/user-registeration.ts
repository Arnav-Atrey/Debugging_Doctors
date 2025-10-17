import { Component, ViewChild, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/userservices';
import { CaptchaComponent } from '../captcha/captcha'; 

@Component({
  selector: 'app-user-registeration',
  templateUrl: './user-registeration.html',
  styleUrls: ['./user-registeration.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CaptchaComponent] 
})

export class UserRegisteration {
  registrationForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isCaptchaValid: boolean = false;
  
  @ViewChild(CaptchaComponent) captchaComponent!: CaptchaComponent;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  // Custom validator to prevent @swasthatech.com for patients
  swasthatechDomainValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const email = control.value.toLowerCase();
    const formGroup = control.parent;
    
    if (formGroup) {
      const role = formGroup.get('role')?.value;
      
      if (role === 'Patient' && email.endsWith('@swasthatech.com')) {
        return { swasthatechDomain: true };
      }
    }
    
    return null;
  }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pswdHash: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$^&])[A-Za-z\d!@#$^&]{10,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: [this.passwordsMatchValidator, this.doctorEmailDomainValidator] });
    // Re-validate email when role changes
    this.registrationForm.get('role')?.valueChanges.subscribe(() => {
      this.registrationForm.get('email')?.updateValueAndValidity();
    });
  }

  onCaptchaValidated(isValid: boolean): void {
    this.isCaptchaValid = isValid;
  }

  passwordsMatchValidator(form: FormGroup) {
  const password = form.get('pswdHash')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
  } else {
    form.get('confirmPassword')?.setErrors(null);
  }
  return null;
}

  doctorEmailDomainValidator(form: FormGroup) {
  const role = form.get('role')?.value;
  const email = form.get('email')?.value;
  if (role === 'Doctor' && email && !email.endsWith('@swasthatech.com')) {
    form.get('email')?.setErrors({ doctorDomain: true });
  } else {
    // Preserve other errors if any
    const errors = form.get('email')?.errors;
    if (errors) {
      delete errors['doctorDomain'];
      if (Object.keys(errors).length === 0) {
        form.get('email')?.setErrors(null);
      } else {
        form.get('email')?.setErrors(errors);
      }
    }
  }
  return null;
}

  onSubmit(): void {    
    if (this.registrationForm.invalid) {
      this.errorMessage = 'Please fill all fields correctly.';
      // Mark all fields as touched to show validation errors
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.isCaptchaValid) {
      this.errorMessage = 'Please complete the CAPTCHA.';
      return;
    }

    const userData = this.registrationForm.value;

    this.userService.register(userData).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful!';
        this.errorMessage = '';
        
        // Store userId for doctor details if role is Doctor
        if (userData.role === 'Doctor') {
          localStorage.setItem('registeredUserId', response.userId.toString());
          
          // Redirect to doctor details page after 1 second
          setTimeout(() => {
            this.router.navigate(['/doctor-details']);
          }, 1000);
        }else if (userData.role === 'Patient') {
          localStorage.setItem('registeredUserId', response.userId.toString());
          
          // Redirect to patient details page after 1 second
          setTimeout(() => {
            this.router.navigate(['/patient-details']);
          }, 1000);
        }  else {
          // For Admin, redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        
        this.registrationForm.reset();
        this.isCaptchaValid = false;
      },
      error: (error) => {
        this.successMessage = '';
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.isCaptchaValid = false;
        this.captchaComponent.refreshCaptcha();
      }
    });
  }

  getPasswordError(): string {
    const control = this.registrationForm.get('pswdHash');
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return 'Password is required.';
    }
    if (control.errors['minlength']) {
      return 'Password must be at least 10 characters long.';
    }
    if (control.errors['pattern']) {
      const value = control.value || '';
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter.';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter.';
      }
      if (!/\d/.test(value)) {
        return 'Password must contain at least one number.';
      }
      if (!/[!@#$^&]/.test(value)) {
        return 'Password must contain at least one special character (!@#$^&).';
      }
      return 'Password does not meet the required criteria.';
    }
    return '';
  }
}