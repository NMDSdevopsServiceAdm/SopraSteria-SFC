import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityDisplayOverviewComponent } from './eligibility-display-overview.component';

describe('EligibilityDisplayOverviewComponent', () => {
  let component: EligibilityDisplayOverviewComponent;
  let fixture: ComponentFixture<EligibilityDisplayOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EligibilityDisplayOverviewComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EligibilityDisplayOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
