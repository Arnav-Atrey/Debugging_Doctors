import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService, PatientProfile, PatientUpdateDto } from '../../services/patientservices';
import { UniqueValidators } from '../../validators/unique-validators';
import { CapitalizeNamePipe } from '../../pipes/capitalize-name.pipe';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CapitalizeNamePipe]
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  patientId: number = 0;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  patientData: PatientProfile | null = null;

  constructor(
  private fb: FormBuilder,
  private patientService: PatientService,
  private router: Router
) {
  this.profileForm = this.fb.group({
    fullName: ['', Validators.required],
    dob: [''],
    gender: [''],
    contactNo: ['', 
      [Validators.pattern(/^\d{10}$/)],
      // Add async validator - will check after patientId is loaded
    ],
    address: [''],
    aadhaarNo: ['', 
      [Validators.pattern(/^\d{12}$/)],
      // Add async validator - will check after patientId is loaded
    ]
  });
}

ngOnInit(): void {
  this.loadPatientId();
  this.loadProfile();
  this.profileForm.disable();
  
  // Add async validators after patientId is loaded
  setTimeout(() => {
    this.profileForm.get('contactNo')?.setAsyncValidators(
      UniqueValidators.uniquePatientContact(this.patientService, this.patientId)
    );
    this.profileForm.get('aadhaarNo')?.setAsyncValidators(
      UniqueValidators.uniquePatientAadhaar(this.patientService, this.patientId)
    );
  }, 100);
}

  loadPatientId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.patientId = userData.patientId || 0;
      
      if (!this.patientId) {
        this.errorMessage = 'Patient profile not found.';
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadProfile(): void {
  if (!this.patientId) return;

  this.isLoading = true;
  this.patientService.getPatientProfile(this.patientId).subscribe({
    next: (data) => {
      console.log('Patient data received:', data); // Debug log
      this.patientData = data;
      
      // Parse DOB properly
      let dobValue = '';
      if (data.dob) {
        dobValue = data.dob.split('T')[0];
      }
      
      this.profileForm.patchValue({
        fullName: data.fullName || '',
        dob: dobValue,
        gender: data.gender || '',
        contactNo: data.contactNo || '',
        address: data.address || '',
        aadhaarNo: data.aadhaarNo || ''
      });
      
      console.log('Form values:', this.profileForm.value); // Debug log
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading profile:', error);
      this.errorMessage = 'Failed to load profile.';
      this.isLoading = false;
    }
  });
}

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.loadProfile(); // Reload to reset any changes
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
  if (this.profileForm.invalid) {
    return;
  }

  // Check if patientData is loaded
  if (!this.patientData || !this.patientData.userId) {
    this.errorMessage = 'Patient data not loaded properly. Please refresh the page.';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  // Create update DTO matching backend expectations
  const updateData: PatientUpdateDto = {
    patientId: this.patientId,
    userId: this.patientData.userId,
    fullName: this.profileForm.value.fullName,
    dob: this.profileForm.value.dob || null,
    gender: this.profileForm.value.gender || null,
    contactNo: this.profileForm.value.contactNo || null,
    address: this.profileForm.value.address || null,
    aadhaarNo: this.profileForm.value.aadhaarNo || null
  };

  console.log('Sending update data:', updateData);

  this.patientService.updatePatientProfile(this.patientId, updateData).subscribe({
    next: (response) => {
      console.log('Update response:', response);
      this.successMessage = 'Profile updated successfully!';
      this.isEditMode = false;
      this.profileForm.disable();
      this.isLoading = false;
      
      // Update localStorage with new name
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        userData.fullName = updateData.fullName;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Reload profile to show updated data
      this.loadProfile();
      
      setTimeout(() => this.successMessage = '', 3000);
    },
    error: (error) => {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.error);
      this.errorMessage = error.error?.message || 'Failed to update profile.';
      this.isLoading = false;
    }
  });
}

  get patientPrefix(): string {
    const gender = this.profileForm.get('gender')?.value;
    if (gender === 'Male') return 'Mr.';
    if (gender === 'Female') return 'Ms.';
    return '';
  }
}