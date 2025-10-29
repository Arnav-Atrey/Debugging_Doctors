import { TestBed } from '@angular/core/testing';

import { Medicineservices } from './medicineservices';

describe('Medicineservices', () => {
  let service: Medicineservices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Medicineservices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
