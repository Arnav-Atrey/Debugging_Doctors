import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { UserLogin } from './user-login/user-login';
import { UserRegisteration } from './user-registeration/user-registeration';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CaptchaComponent } from './captcha/captcha';
import { DoctorDetails } from './doctor-details/doctor-details';
import { PatientDetails } from './patient-details/patient-details';
import { DoctorListComponent } from './patient/doctor-list/doctor-list';
import { BookAppointmentComponent } from './patient/book-appointment/book-appointment';
import { MyAppointmentsComponent } from './patient/my-appointments/my-appointments';
import { DoctorDashboardComponent } from './doctor/dashboard/dashboard';
import { NavbarComponent } from './shared/navbar/navbar';
import { PatientProfileComponent } from './patient/profile/profile';
import { DoctorProfileComponent } from './doctor/profile/profile';
import { AI } from './ai/ai';

@NgModule({
  declarations: [
    App,
    PatientDetails,
    AI,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    UserLogin,
    UserRegisteration,
    DoctorDetails,
    CaptchaComponent,
    DoctorListComponent,
    BookAppointmentComponent,
    MyAppointmentsComponent,
    DoctorDashboardComponent,
    NavbarComponent,
    PatientProfileComponent,
    DoctorProfileComponent
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
