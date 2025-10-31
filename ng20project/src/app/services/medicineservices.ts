// services/medicine.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicineDto {
  medicineID: number;
  name: string;
  pricePerTablet: number;
}

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private api = 'https://localhost:7090/api/Medicines';

  constructor(private http: HttpClient) {}

  getBySpecialization(spec: string): Observable<MedicineDto[]> {
    return this.http.get<MedicineDto[]>(`${this.api}/by-specialization/${spec}`);
  }
}