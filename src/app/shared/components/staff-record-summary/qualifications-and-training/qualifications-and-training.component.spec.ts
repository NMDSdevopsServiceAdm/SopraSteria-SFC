import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationsAndTrainingComponent } from './qualifications-and-training.component';

describe('QualificationsAndTrainingComponent', () => {
  let component: QualificationsAndTrainingComponent;
  let fixture: ComponentFixture<QualificationsAndTrainingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QualificationsAndTrainingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificationsAndTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
