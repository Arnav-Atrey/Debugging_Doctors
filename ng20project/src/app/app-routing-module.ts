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

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: UserRegisteration },
  { path: 'home', redirectTo: '/register' },  // Add this redirect
  {path: 'login', component: UserLogin},
  {path: 'doctor-details', component: DoctorDetails},
  {path: 'patient-details', component: PatientDetails},
  // Patient Routes
  { path: 'patient/doctors', component: DoctorListComponent },
  { path: 'patient/book-appointment/:doctorId', component: BookAppointmentComponent },
  { path: 'patient/my-appointments', component: MyAppointmentsComponent },
  { path: 'patient/profile', component: PatientProfileComponent },
  
  // Doctor Routes
  { path: 'doctor/dashboard', component: DoctorDashboardComponent },
  { path: 'doctor/profile', component: DoctorProfileComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
