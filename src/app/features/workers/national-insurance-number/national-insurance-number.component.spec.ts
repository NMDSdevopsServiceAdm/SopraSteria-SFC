import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalInsuranceNumberComponent } from './national-insurance-number.component';

describe('NationalInsuranceNumberComponent', () => {
  let component: NationalInsuranceNumberComponent;
  let fixture: ComponentFixture<NationalInsuranceNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NationalInsuranceNumberComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NationalInsuranceNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
