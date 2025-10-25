import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminDto } from '../../services/adminservices';

@Component({
  selector: 'app-pending-approvals',
  templateUrl: './pending-approvals.html',
  styleUrls: ['./pending-approvals.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PendingApprovalsComponent implements OnInit {
  pendingAdmins: AdminDto[] = [];
  currentAdminId: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadCurrentAdminId();
    this.loadPendingAdmins();
  }

  loadCurrentAdminId(): void {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.currentAdminId = userData.adminId || 0;
    }
  }

  loadPendingAdmins(): void {
    this.isLoading = true;
    this.adminService.getPendingAdmins().subscribe({
      next: (data) => {
        this.pendingAdmins = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending admins:', error);
        this.errorMessage = 'Failed to load pending admin applications.';
        this.isLoading = false;
      }
    });
  }

  approveAdmin(adminId: number): void {
    if (!confirm('Are you sure you want to approve this admin?')) {
      return;
    }

    this.adminService.approveAdmin(adminId, this.currentAdminId).subscribe({
      next: () => {
        this.successMessage = 'Admin approved successfully!';
        this.loadPendingAdmins();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error approving admin:', error);
        this.errorMessage = 'Failed to approve admin.';
      }
    });
  }

  rejectAdmin(adminId: number): void {
    if (!confirm('Are you sure you want to reject this admin application? This action will delete the account.')) {
      return;
    }

    this.adminService.rejectAdmin(adminId).subscribe({
      next: () => {
        this.successMessage = 'Admin application rejected.';
        this.loadPendingAdmins();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error rejecting admin:', error);
        this.errorMessage = 'Failed to reject admin.';
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}