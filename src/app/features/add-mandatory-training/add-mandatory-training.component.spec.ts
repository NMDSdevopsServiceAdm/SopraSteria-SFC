import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockJobService } from '@core/test-utils/MockJobService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddMandatoryTrainingComponent } from './add-mandatory-training.component';
import { AddMandatoryTrainingModule } from './add-mandatory-training.module';

describe('AddMandatoryTrainingComponent', () => {
  async function setup() {
    const { getByText, getByLabelText, getAllByLabelText, getAllByText, queryByText, fixture } = await render(
      AddMandatoryTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule, HttpClientTestingModule],
        declarations: [],
        providers: [
          AlertService,
          BackService,
          DialogService,
          TrainingService,
          {
            provide: WindowRef,
            useClass: WindowRef,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: TrainingService,
            useClass: MockTrainingService,
          },
          {
            provide: JobService,
            useClass: MockJobService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  data: {
                    establishment: {
                      uid: '123',
                    },
                  },
                },
              },
            },
          },
        ],
      },
    );
    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);

    const updateMandatoryTrainingSpy = spyOn(establishmentService, 'updateMandatoryTraining').and.callThrough();

    return {
      component,
      fixture,
      updateMandatoryTrainingSpy,
      getByText,
      getByLabelText,
      getAllByLabelText,
      getAllByText,
      queryByText,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('Should display the add mandatory training title', async () => {
    const { getByText } = await setup();
    expect(getByText('Add a mandatory training category')).toBeTruthy();
  });

  describe('submit buttons', async () => {
    it('Should render save and return button and cancel link', async () => {
      const { getByText } = await setup();
      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('trainingCategory form', async () => {
    it('Should call updateMandatoryTraining on submit when a training is selected and all Job roles is selected', async () => {
      const { component, updateMandatoryTrainingSpy, fixture, getByLabelText, getByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[0].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(updateMandatoryTrainingSpy).toHaveBeenCalled();
    });

    it('Should call updateMandatoryTraining on submit when a training is selected and one specified job role is selected', async () => {
      const { component, updateMandatoryTrainingSpy, fixture, getByLabelText, getByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[1].label);
      fireEvent.click(allJobRolesRadioButton);

      const specficJobRoleSelect = getByLabelText('Job role', { exact: true });
      fireEvent.change(specficJobRoleSelect, { target: { value: 27 } });

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(updateMandatoryTrainingSpy).toHaveBeenCalled();
    });

    it('Should call updateMandatoryTraining on submit when a training is selected and multiple specified job roles are selected', async () => {
      const { component, updateMandatoryTrainingSpy, fixture, getByLabelText, getByText, getAllByLabelText } =
        await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[1].label);
      fireEvent.click(allJobRolesRadioButton);

      const addAnotherJobRoleButton = getByText('Add another job role');
      fireEvent.click(addAnotherJobRoleButton);

      fixture.detectChanges();

      const specficJobRoleSelectArray = getAllByLabelText('Job role', { exact: true });

      fireEvent.change(specficJobRoleSelectArray[0], { target: { value: 27 } });
      fireEvent.change(specficJobRoleSelectArray[1], { target: { value: 23 } });

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(updateMandatoryTrainingSpy).toHaveBeenCalled();
    });
  });

  describe('vacancyType form', async () => {
    it('Should not display a job role selection when All job roles is selected', async () => {
      const { component, fixture, getByLabelText, queryByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[0].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      expect(queryByText('Job role', { exact: true })).toBeFalsy();
    });

    it('Should display a job role selection when All job roles is selected', async () => {
      const { component, fixture, getByLabelText, queryByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[1].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      expect(queryByText('Job role', { exact: true })).toBeTruthy();
    });
  });

  describe('error messages', async () => {
    describe('mandatory training category', async () => {
      it('Should display a Select the mandatory training error message if the form is submitted without a category input and all job roles is selected', async () => {
        const { updateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } =
          await setup();

        const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[0].label);
        fireEvent.click(allJobRolesRadioButton);

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(updateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getAllByText('Select the mandatory training').length).toEqual(2);
      });

      it('Should display a Select the mandatory training error message if the form is submitted without a category input and only selected job roles is selected', async () => {
        const { updateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } =
          await setup();

        const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[1].label);
        fireEvent.click(allJobRolesRadioButton);

        const specficJobRoleSelect = getByLabelText('Job role', { exact: true });
        fireEvent.change(specficJobRoleSelect, { target: { value: 27 } });

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(updateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getAllByText('Select the mandatory training').length).toEqual(2);
      });
    });

    describe('job roles', async () => {
      it('Should display a select the job role error message if the form is submitted without a specifc job role input and a mandatory training is selected', async () => {
        const { updateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText } = await setup();

        const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
        fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

        const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[1].label);
        fireEvent.click(allJobRolesRadioButton);

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(updateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getByText('Select the job role')).toBeTruthy();
        expect(getByText('Select the job role (job role 1)')).toBeTruthy();
      });

      it('Should display multiple select the job role error messages if the form is submitted when several specifc job role inputs are empty and a mandatory training is selected', async () => {
        const { updateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } =
          await setup();

        const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
        fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

        const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[1].label);
        fireEvent.click(allJobRolesRadioButton);

        const addAnotherJobRoleButton = getByText('Add another job role');
        fireEvent.click(addAnotherJobRoleButton);

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(updateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getAllByText('Select the job role').length).toEqual(2);
        expect(getByText('Select the job role (job role 1)')).toBeTruthy();
        expect(getByText('Select the job role (job role 2)')).toBeTruthy();
      });
    });

    it('should display a mandatory training error and a job role error if a mandatory training is not provided, only selected job roles is selected and a job role is not specified', async () => {
      const { updateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } = await setup();

      const allJobRolesRadioButton = getByLabelText(component.vacanciesOptions[1].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(updateMandatoryTrainingSpy).not.toHaveBeenCalled();
      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText('Select the mandatory training').length).toEqual(2);
      expect(getByText('Select the job role')).toBeTruthy();
      expect(getByText('Select the job role (job role 1)')).toBeTruthy();
    });
  });

  describe('setBackLink', async () => {
    it('should return to the add and manage mandatory training page', async () => {
      const { component, fixture } = await setup();
      component.setBackLink();
      fixture.detectChanges();

      expect(component.return).toEqual({
        url: ['/workplace', component.primaryWorkplace.uid, 'add-and-manage-mandatory-training'],
      });
    });
  });
});
