import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MissingMandatoryTrainingComponent } from './missing-mandatory-training.component';

fdescribe('MissingMandatoryTrainingComponent', () => {
  let component: MissingMandatoryTrainingComponent;
  let fixture: ComponentFixture<MissingMandatoryTrainingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(MissingMandatoryTrainingComponent);
    component = fixture.componentInstance;
  });

  it('should create a MissingMandatoryTrainingComponent', async () => {
    expect(component).toBeTruthy();
  });
});
