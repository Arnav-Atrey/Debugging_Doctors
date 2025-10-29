import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsManagement } from './appointments-management';

describe('AppointmentsManagement', () => {
  let component: AppointmentsManagement;
  let fixture: ComponentFixture<AppointmentsManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppointmentsManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
