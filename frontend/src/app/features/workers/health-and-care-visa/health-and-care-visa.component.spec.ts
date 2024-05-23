import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthAndCareVisaComponent } from './health-and-care-visa.component';

describe('HealthAndCareVisaComponent', () => {
  let component: HealthAndCareVisaComponent;
  let fixture: ComponentFixture<HealthAndCareVisaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HealthAndCareVisaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthAndCareVisaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
