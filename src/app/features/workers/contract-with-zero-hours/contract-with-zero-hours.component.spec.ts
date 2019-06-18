import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractWithZeroHoursComponent } from './contract-with-zero-hours.component';

describe('ContractWithZeroHoursComponent', () => {
  let component: ContractWithZeroHoursComponent;
  let fixture: ComponentFixture<ContractWithZeroHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContractWithZeroHoursComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractWithZeroHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
