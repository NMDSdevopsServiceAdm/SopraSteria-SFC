import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MandatoryTrainingComponent } from './mandatory-training.component';

describe('MandatoryTrainingComponent', () => {
  let component: MandatoryTrainingComponent;
  let fixture: ComponentFixture<MandatoryTrainingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MandatoryTrainingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MandatoryTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
