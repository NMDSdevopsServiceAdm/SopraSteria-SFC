import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRegulatedByCqcComponent } from './new-regulated-by-cqc.component';

describe('NewRegulatedByCqcComponent', () => {
  let component: NewRegulatedByCqcComponent;
  let fixture: ComponentFixture<NewRegulatedByCqcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewRegulatedByCqcComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewRegulatedByCqcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
