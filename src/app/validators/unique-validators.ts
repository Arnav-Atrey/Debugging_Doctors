import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first } from 'rxjs/operators';
import { PatientService } from '../services/patientservices';
import { DoctorService } from '../services/doctorservices';
import { HttpClient } from '@angular/common/http';

export class UniqueValidators {
  
  static uniquePatientContact(patientService: PatientService, excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length !== 10) {
        return of(null);
      }

      return control.valueChanges.pipe(
        debounceTime(500),
        switchMap(() => 
          patientService.checkContactExists(control.value, excludeId).pipe(
            map(result => result.exists ? { contactTaken: true } : null),
            catchError(() => of(null))
          )
        ),
        first()
      );
    };
  }

  static uniquePatientAadhaar(patientService: PatientService, excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length !== 12) {
        return of(null);
      }

      return control.valueChanges.pipe(
        debounceTime(500),
        switchMap(() => 
          patientService.checkAadhaarExists(control.value, excludeId).pipe(
            map(result => result.exists ? { aadhaarTaken: true } : null),
            catchError(() => of(null))
          )
        ),
        first()
      );
    };
  }

  static uniqueDoctorContact(http: HttpClient, excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length !== 10) {
        return of(null);
      }

      const params = excludeId ? `?excludeDoctorId=${excludeId}` : '';
      return control.valueChanges.pipe(
        debounceTime(500),
        switchMap(() => 
          http.get<{exists: boolean}>(`https://localhost:7090/api/Doctors/check-contact/${control.value}${params}`).pipe(
            map(result => result.exists ? { contactTaken: true } : null),
            catchError(() => of(null))
          )
        ),
        first()
      );
    };
  }

  static uniqueDoctorHpid(http: HttpClient, excludeId?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const params = excludeId ? `?excludeDoctorId=${excludeId}` : '';
      return control.valueChanges.pipe(
        debounceTime(500),
        switchMap(() => 
          http.get<{exists: boolean}>(`https://localhost:7090/api/Doctors/check-hpid/${control.value}${params}`).pipe(
            map(result => result.exists ? { hpidTaken: true } : null),
            catchError(() => of(null))
          )
        ),
        first()
      );
    };
  }
}