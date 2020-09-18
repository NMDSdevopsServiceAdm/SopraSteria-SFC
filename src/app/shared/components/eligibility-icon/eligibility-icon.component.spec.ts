import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityIconComponent } from './eligibility-icon.component';

describe('EligibilityIconComponent', () => {
  let component: EligibilityIconComponent;
  let fixture: ComponentFixture<EligibilityIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EligibilityIconComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EligibilityIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
