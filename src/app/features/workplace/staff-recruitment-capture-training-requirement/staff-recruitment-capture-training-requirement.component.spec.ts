import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { StaffRecruitmentCaptureTrainingRequirementComponent } from './staff-recruitment-capture-training-requirement.component';

describe('StaffRecruitmentCaptureTrainingRequirement', () => {
  async function setup() {
    const { fixture, getByText, getByLabelText } = await render(StaffRecruitmentCaptureTrainingRequirementComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'postStaffRecruitmentData').and.callThrough();

    return { component, fixture, getByText, getByLabelText, establishmentServiceSpy };
  }

  it('should render StaffRecruitmentCaptureTrainingRequirementComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the save and continue button', async () => {
    const { getByText } = await setup();

    expect(getByText('Save and return')).toBeTruthy();
  });

  it('should submit the form with the correct value when the "Yes, always" radio button is selected and the form is submitted', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Yes, always');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and return');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
      staffRecruitmentColumn: 'doNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
      staffRecruitmentData: 'Yes, always',
    });
  });

  it('should submit the form with the correct value when the "Yes, very often" radio button is selected and the form is submitted', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Yes, very often');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and return');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
      staffRecruitmentColumn: 'doNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
      staffRecruitmentData: 'Yes, very often',
    });
  });

  it('should submit the form with the correct value when the "Yes, but not very often" radio button is selected and the form is submitted', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('Yes, but not very often');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and return');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
      staffRecruitmentColumn: 'doNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
      staffRecruitmentData: 'Yes, but not very often',
    });
  });

  it('should submit the form with the correct value when the "No, never" radio button is selected and the form is submitted', async () => {
    const { fixture, getByText, getByLabelText, establishmentServiceSpy } = await setup();

    const radioButton = getByLabelText('No, never');
    fireEvent.click(radioButton);
    fixture.detectChanges();

    const submitButton = getByText('Save and return');
    fireEvent.click(submitButton);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
      staffRecruitmentColumn: 'doNewStartersRepeatMandatoryTrainingFromPreviousEmployment',
      staffRecruitmentData: 'No, never',
    });
  });
});
