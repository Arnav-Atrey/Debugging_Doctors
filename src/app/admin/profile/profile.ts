import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminDto, AdminUpdateDto } from '../../services/adminservices';
import { CapitalizeNamePipe } from '../../pipes/capitalize-name.pipe';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CapitalizeNamePipe]
})
export class AdminProfileComponent implements OnInit {
  profileForm: FormGroup;
  adminId: number = 0;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  adminData: AdminDto | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      department: [''],
      contactNo: ['', [Validators.pattern(/^\d{10}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadAdminId();
    this.loadProfile();
    this.profileForm.disable();
  }

  loadAdminId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.adminId = userData.adminId || 0;
      
      if (!this.adminId) {
        this.errorMessage = 'Admin profile not found.';
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadProfile(): void {
    if (!this.adminId) return;

    this.isLoading = true;
    this.adminService.getAdmin(this.adminId).subscribe({
      next: (data) => {
        this.adminData = data;
        this.profileForm.patchValue({
          fullName: data.fullName,
          department: data.department,
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

    if (!this.adminData || !this.adminData.userId) {
      this.errorMessage = 'Admin data not loaded properly. Please refresh the page.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData: AdminUpdateDto = {
      adminId: this.adminId,
      userId: this.adminData.userId,
      fullName: this.profileForm.value.fullName,
      department: this.profileForm.value.department || null,
      contactNo: this.profileForm.value.contactNo || null
    };

    this.adminService.updateAdmin(this.adminId, updateData).subscribe({
      next: (response) => {
        console.log('Update response:', response);
        this.successMessage = 'Profile updated successfully!';
        this.isEditMode = false;
        this.profileForm.disable();
        this.isLoading = false;
        
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          userData.fullName = updateData.fullName;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        this.loadProfile();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.message || 'Failed to update profile.';
        this.isLoading = false;
      }
    });
  }
}