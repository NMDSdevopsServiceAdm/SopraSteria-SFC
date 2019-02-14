import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApprenticeshipTrainingComponent } from './apprenticeship-training.component';

describe('ApprenticeshipTrainingComponent', () => {
  let component: ApprenticeshipTrainingComponent;
  let fixture: ComponentFixture<ApprenticeshipTrainingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApprenticeshipTrainingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprenticeshipTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
