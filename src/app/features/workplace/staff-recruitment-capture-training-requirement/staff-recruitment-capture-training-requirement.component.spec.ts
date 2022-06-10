import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StaffRecruitmentCaptureTrainingRequirementComponent } from './staff-recruitment-capture-training-requirement.component';

describe('StaffRecruitmentCaptureTrainingRequirement', () => {
  async function setup() {
    const { fixture } = await render(StaffRecruitmentCaptureTrainingRequirementComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [FormBuilder],
    });

    const component = fixture.componentInstance;

    return { component };
  }

  it('should render StaffRecruitmentCaptureTrainingRequirementComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
