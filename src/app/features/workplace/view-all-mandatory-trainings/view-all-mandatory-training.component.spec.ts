import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllMandatoryTrainingComponent } from './view-all-mandatory-training.component';

describe('ViewAllMandatoryTrainingComponent', () => {
  let component: ViewAllMandatoryTrainingComponent;
  let fixture: ComponentFixture<ViewAllMandatoryTrainingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAllMandatoryTrainingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllMandatoryTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
