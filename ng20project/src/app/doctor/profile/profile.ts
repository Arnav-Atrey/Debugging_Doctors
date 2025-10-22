import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService, Doctor, DoctorUpdateDto } from '../../services/doctorservices';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DoctorProfileComponent implements OnInit {
  profileForm: FormGroup;
  doctorId: number = 0;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  doctorData: Doctor | null = null;
  showOtherSpecialisation: boolean = false;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private http: HttpClient,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      specialisation: [''],
      hpid: [''],
      availability: [''],
      contactNo: ['', [Validators.pattern(/^\d{10}$/)]]
    });
  }

  ngOnInit(): void {
  this.loadDoctorId();
  this.loadProfile();
  this.profileForm.disable();
  
  // Watch for specialisation changes
  this.profileForm.get('specialisation')?.valueChanges.subscribe(value => {
    this.showOtherSpecialisation = value === 'Other';
  });
}

  loadDoctorId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.doctorId = userData.doctorId || 0;
      
      if (!this.doctorId) {
        this.errorMessage = 'Doctor profile not found.';
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadProfile(): void {
    if (!this.doctorId) return;

    this.isLoading = true;
    this.doctorService.getDoctor(this.doctorId).subscribe({
      next: (data) => {
        this.doctorData = data;
        this.profileForm.patchValue({
          fullName: data.fullName,
          specialisation: data.specialisation,
          hpid: data.hpid,
          availability: data.availability,
          contactNo: data.contactNo
        });
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
      this.loadProfile();
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
  if (this.profileForm.invalid) {
    return;
  }

  // Check if doctorData is loaded
  if (!this.doctorData || !this.doctorData.userId) {
    this.errorMessage = 'Doctor data not loaded properly. Please refresh the page.';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';
  this.successMessage = '';

  // Create update DTO matching backend expectations
  const updateData: DoctorUpdateDto = {
    docId: this.doctorId,
    userId: this.doctorData.userId,
    fullName: this.profileForm.value.fullName,
    specialisation: this.profileForm.value.specialisation || null,
    hpid: this.profileForm.value.hpid || null,
    availability: this.profileForm.value.availability || null,
    contactNo: this.profileForm.value.contactNo || null
  };

  console.log('Sending update data:', updateData);

  this.doctorService.updateDoctor(this.doctorId, updateData).subscribe({
    next: (response) => {
      console.log('Update response:', response);
      this.successMessage = 'Profile updated successfully!';
      this.isEditMode = false;
      this.profileForm.disable();
      this.isLoading = false;
      
      // Update localStorage
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
}