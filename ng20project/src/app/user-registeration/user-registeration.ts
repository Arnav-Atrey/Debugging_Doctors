import { Component, ViewChild, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/userservices';
import { CaptchaComponent } from '../captcha/captcha'; 
import { AdminService } from '../services/adminservices';

@Component({
  selector: 'app-user-registeration',
  templateUrl: './user-registeration.html',
  styleUrls: ['./user-registeration.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CaptchaComponent] 
})

export class UserRegisteration implements OnInit {
  registrationForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isCaptchaValid: boolean = false;
  showAdminFields: boolean = false;
  
  @ViewChild(CaptchaComponent) captchaComponent!: CaptchaComponent;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.swasthatechDomainValidator]],
      pswdHash: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$^&])[A-Za-z\d!@#$^&]{10,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required],
      fullName: [''],
      department: [''],
      contactNo: ['', [Validators.pattern(/^\d{10}$/)]]
    }, { validators: [this.passwordsMatchValidator, this.doctorEmailDomainValidator] });

    // Watch for role changes
    this.registrationForm.get('role')?.valueChanges.subscribe(role => {
      this.showAdminFields = role === 'Admin';
      this.updateAdminFieldValidators(role === 'Admin');
      this.registrationForm.get('email')?.updateValueAndValidity();
    });
  }

  updateAdminFieldValidators(isAdmin: boolean): void {
    const fullNameControl = this.registrationForm.get('fullName');
    const departmentControl = this.registrationForm.get('department');
    
    if (isAdmin) {
      fullNameControl?.setValidators([Validators.required]);
      departmentControl?.setValidators([Validators.required]);
    } else {
      fullNameControl?.clearValidators();
      departmentControl?.clearValidators();
    }
    
    fullNameControl?.updateValueAndValidity();
    departmentControl?.updateValueAndValidity();
  }

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
      
      if (role === 'Admin' && !email.endsWith('@swasthatech.com')) {
        return { adminDomainRequired: true };
      }
    }
    
    return null;
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
      Object.keys(this.registrationForm.controls).forEach(key => {
        this.registrationForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.isCaptchaValid) {
      this.errorMessage = 'Please complete the CAPTCHA.';
      return;
    }

    const role = this.registrationForm.value.role;

    if (role === 'Admin') {
      const adminData = {
        email: this.registrationForm.value.email,
        pswdHash: this.registrationForm.value.pswdHash,
        fullName: this.registrationForm.value.fullName,
        department: this.registrationForm.value.department,
        contactNo: this.registrationForm.value.contactNo
      };

      this.adminService.registerAdmin(adminData).subscribe({
        next: (response) => {
          console.log('Admin registration successful');
          this.successMessage = response.message || 'Admin registration successful! Waiting for approval...';
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.isCaptchaValid = false;
          this.captchaComponent.refreshCaptcha();
        }
      });
    } else {
      const registrationData = {
        email: this.registrationForm.value.email,
        pswdHash: this.registrationForm.value.pswdHash,
        role: this.registrationForm.value.role
      };

      this.userService.register(registrationData).subscribe({
        next: (response) => {
          this.successMessage = 'Registration successful!';
          this.errorMessage = '';
          
          localStorage.setItem('registeredUserId', response.userId.toString());
          
          if (registrationData.role === 'Doctor') {
            setTimeout(() => {
              this.router.navigate(['/doctor-details']);
            }, 1000);
          } else if (registrationData.role === 'Patient') {
            setTimeout(() => {
              this.router.navigate(['/patient-details']);
            }, 1000);
          }
          
          this.registrationForm.reset();
          this.isCaptchaValid = false;
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.isCaptchaValid = false;
          this.captchaComponent.refreshCaptcha();
        }
      });
    }
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