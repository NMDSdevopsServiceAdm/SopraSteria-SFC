import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WdfEligibilityComponent } from '@features/reports/wdf-eligibility/wdf-eligibility.component';

describe('EligibilityDisplayOverviewComponent', () => {
  let component: WdfEligibilityComponent;
  let fixture: ComponentFixture<WdfEligibilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WdfEligibilityComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdfEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
