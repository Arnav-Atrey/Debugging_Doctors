import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRegisteration } from './user-registeration/user-registeration';
import { UserLogin } from './user-login/user-login';
import { DoctorDetails } from './doctor-details/doctor-details';
import { PatientDetails } from './patient-details/patient-details';
import { DoctorListComponent } from './patient/doctor-list/doctor-list';
import { BookAppointmentComponent } from './patient/book-appointment/book-appointment';
import { MyAppointmentsComponent } from './patient/my-appointments/my-appointments';
import { DoctorDashboardComponent } from './doctor/dashboard/dashboard';
import { PatientProfileComponent } from './patient/profile/profile';
import { DoctorProfileComponent } from './doctor/profile/profile';
// Admin Routes
import { AdminDashboardComponent } from './admin/dashboard/dashboard';
import { PendingApprovalsComponent } from './admin/pending-approvals/pending-approvals';
import { DoctorsManagementComponent } from './admin/doctors-management/doctors-management';
import { PatientsManagementComponent } from './admin/patients-management/patients-management';
import { AppointmentsManagementComponent } from './admin/appointments-management/appointments-management';
import { AdminProfileComponent } from './admin/profile/profile';
import { AuthGuard } from './guards/auth-guard';
import { DeletedRecordsComponent } from './admin/deleted-records/deleted-records';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: UserRegisteration },
  { path: 'home', redirectTo: '/register' },  // Add this redirect
  {path: 'login', component: UserLogin},
  {path: 'doctor-details', component: DoctorDetails},
  {path: 'patient-details', component: PatientDetails},
  // Patient Routes
  { path: 'patient/doctors', component: DoctorListComponent,canActivate: [AuthGuard],data: { role: 'Patient' } },
  { path: 'patient/book-appointment/:doctorId', component: BookAppointmentComponent,canActivate: [AuthGuard],data: { role: 'Patient' } },
  { path: 'patient/my-appointments', component: MyAppointmentsComponent,canActivate: [AuthGuard],data: { role: 'Patient' } },
  { path: 'patient/profile', component: PatientProfileComponent,canActivate: [AuthGuard],data: { role: 'Patient' } },
  
  // Doctor Routes
  { path: 'doctor/dashboard', component: DoctorDashboardComponent,canActivate: [AuthGuard],data: { role: 'Doctor' }  },
  { path: 'doctor/profile', component: DoctorProfileComponent,canActivate: [AuthGuard],data: { role: 'Doctor' }  },

  // Admin Routes
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'admin/pending-approvals', 
    component: PendingApprovalsComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'admin/doctors', 
    component: DoctorsManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'admin/patients', 
    component: PatientsManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'admin/appointments', 
    component: AppointmentsManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'admin/deleted-records', 
    component: DeletedRecordsComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  { 
    path: 'admin/profile', 
    component: AdminProfileComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
