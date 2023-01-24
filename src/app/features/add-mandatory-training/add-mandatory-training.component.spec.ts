import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  async function setup(renderAsEditMandatoryTraining = false, trainingCategoryId = '9') {
    const { getByText, getByLabelText, getAllByLabelText, getAllByText, queryByText, fixture } = await render(
      AddMandatoryTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule, HttpClientTestingModule],
        declarations: [],
        providers: [
          AlertService,
          BackService,
          DialogService,
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
              snapshot: {
                parent: {
                  url: [{ path: trainingCategoryId ? trainingCategoryId : 'add-and-manage-mandatory-training' }],
                  data: {
                    establishment: {
                      uid: '9',
                    },
                  },
                },
                url: [
                  { path: renderAsEditMandatoryTraining ? 'edit-mandatory-training' : 'add-new-mandatory-training' },
                ],
              },
            },
          },
        ],
      },
    );
    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    const alertService = injector.inject(AlertService) as AlertService;
    const router = injector.inject(Router) as Router;

    const createAndUpdateMandatoryTrainingSpy = spyOn(
      establishmentService,
      'createAndUpdateMandatoryTraining',
    ).and.callThrough();
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      createAndUpdateMandatoryTrainingSpy,
      alertSpy,
      routerSpy,
      getByText,
      getByLabelText,
      getAllByLabelText,
      getAllByText,
      queryByText,
    };
  }

  describe('component renderings', async () => {
    it('should render the component', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    });

    it('Should display the add mandatory training title when not in edit version of page', async () => {
      const { getByText } = await setup();
      expect(getByText('Add a mandatory training category')).toBeTruthy();
    });

    it('Should display the edit mandatory training title when in edit version of page', async () => {
      const { getByText } = await setup(true);
      expect(getByText('Mandatory training category')).toBeTruthy();
    });

    it('should render the remove training link when in edit version of the page', async () => {
      const { getByText } = await setup(true);
      expect(getByText('Remove this mandatory training category')).toBeTruthy();
    });

    it('Should render save and return button and cancel link', async () => {
      const { getByText } = await setup();
      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('prefill', async () => {
    it('should prefill the training category and all job roles when a mandatory training with all job roles is selected', async () => {
      const { component } = await setup(true);

      expect(component.form.value.trainingCategory).toEqual(9);
      expect(component.form.value.allOrSelectedJobRoles).toEqual('all');
      expect(component.form.value.selectedJobRoles).toEqual([]);
    });

    it('should prefill the training category and all job roles when a mandatory training with all job roles is selected', async () => {
      const { component } = await setup(true, '123');

      expect(component.form.value.trainingCategory).toEqual(123);
      expect(component.form.value.allOrSelectedJobRoles).toEqual('selected');
      expect(component.form.value.selectedJobRoles).toEqual([
        {
          id: 15,
        },
      ]);
    });
  });

  describe('trainingCategory form', async () => {
    it('Should call createAndUpdateMandatoryTraining on submit when a training is selected and all Job roles is selected', async () => {
      const { component, createAndUpdateMandatoryTrainingSpy, fixture, getByLabelText, getByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[0].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(createAndUpdateMandatoryTrainingSpy).toHaveBeenCalled();
    });

    it('Should call createAndUpdateMandatoryTraining on submit when a training is selected and one specified job role is selected', async () => {
      const { component, createAndUpdateMandatoryTrainingSpy, fixture, getByLabelText, getByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[1].label);
      fireEvent.click(allJobRolesRadioButton);

      const specficJobRoleSelect = getByLabelText('Job role 1', { exact: true });
      fireEvent.change(specficJobRoleSelect, { target: { value: 27 } });

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(createAndUpdateMandatoryTrainingSpy).toHaveBeenCalled();
    });

    it('Should call createAndUpdateMandatoryTraining on submit when a training is selected and multiple specified job roles are selected', async () => {
      const { component, createAndUpdateMandatoryTrainingSpy, fixture, getByLabelText, getByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[1].label);
      fireEvent.click(allJobRolesRadioButton);

      const addAnotherJobRoleButton = getByText('Add another job role');
      fireEvent.click(addAnotherJobRoleButton);

      fixture.detectChanges();

      const specifiedJobRoleOne = getByLabelText('Job role 1', { exact: true });
      const specifiedJobRoleTwo = getByLabelText('Job role 2', { exact: true });

      fireEvent.change(specifiedJobRoleOne, { target: { value: 27 } });
      fireEvent.change(specifiedJobRoleTwo, { target: { value: 23 } });

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(createAndUpdateMandatoryTrainingSpy).toHaveBeenCalled();
    });
  });

  describe('allOrSelectedJobRoles form', async () => {
    it('Should not display a job role selection when All job roles is selected', async () => {
      const { component, fixture, getByLabelText, queryByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[0].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      expect(queryByText('Job role 1', { exact: true })).toBeFalsy();
    });

    it('Should display a job role selection when All job roles is not selected selected', async () => {
      const { component, fixture, getByLabelText, queryByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[1].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      expect(queryByText('Job role 1', { exact: true })).toBeTruthy();
    });
  });

  describe('error messages', async () => {
    describe('mandatory training category', async () => {
      it('Should display a Select the training category you want to be mandatory error message if the form is submitted without a category input and all job roles is selected', async () => {
        const { createAndUpdateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } =
          await setup();

        const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[0].label);
        fireEvent.click(allJobRolesRadioButton);

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(createAndUpdateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getAllByText('Select the training category you want to be mandatory').length).toEqual(2);
      });

      it('Should display a Select the training category you want to be mandatory error message if the form is submitted without a category input and only selected job roles is selected', async () => {
        const { createAndUpdateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } =
          await setup();

        const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[1].label);
        fireEvent.click(allJobRolesRadioButton);

        const specficJobRoleSelect = getByLabelText('Job role 1', { exact: true });
        fireEvent.change(specficJobRoleSelect, { target: { value: 27 } });

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(createAndUpdateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getAllByText('Select the training category you want to be mandatory').length).toEqual(2);
      });
    });

    describe('allOrSelectedJobRoles', async () => {
      it('Should display a Select which job roles need this training error message if the form is submitted without a job role radio button selected', async () => {
        const { createAndUpdateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } =
          await setup();

        const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
        fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(createAndUpdateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getAllByText('Select which job roles need this training').length).toEqual(2);
      });
    });

    describe('job roles', async () => {
      it('Should display a select the job role error message if the form is submitted without a specifc job role input and a mandatory training is selected', async () => {
        const { createAndUpdateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText } = await setup();

        const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
        fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

        const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[1].label);
        fireEvent.click(allJobRolesRadioButton);

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(createAndUpdateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getByText('Select the job role')).toBeTruthy();
        expect(getByText('Select the job role (job role 1)')).toBeTruthy();
      });

      it('Should display multiple select the job role error messages if the form is submitted when several specifc job role inputs are empty and a mandatory training is selected', async () => {
        const { createAndUpdateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } =
          await setup();

        const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
        fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

        const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[1].label);
        fireEvent.click(allJobRolesRadioButton);

        const addAnotherJobRoleButton = getByText('Add another job role');
        fireEvent.click(addAnotherJobRoleButton);

        fixture.detectChanges();

        const submitButton = getByText('Save and return');
        fireEvent.click(submitButton);

        expect(createAndUpdateMandatoryTrainingSpy).not.toHaveBeenCalled();
        expect(component.form.invalid).toBeTruthy();
        expect(getAllByText('Select the job role').length).toEqual(2);
        expect(getByText('Select the job role (job role 1)')).toBeTruthy();
        expect(getByText('Select the job role (job role 2)')).toBeTruthy();
      });
    });

    it('should display a mandatory training error and a job role error if a mandatory training is not provided, only selected job roles is selected and a job role is not specified', async () => {
      const { createAndUpdateMandatoryTrainingSpy, component, fixture, getByLabelText, getByText, getAllByText } =
        await setup();

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[1].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(createAndUpdateMandatoryTrainingSpy).not.toHaveBeenCalled();
      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText('Select the training category you want to be mandatory').length).toEqual(2);
      expect(getByText('Select the job role')).toBeTruthy();
      expect(getByText('Select the job role (job role 1)')).toBeTruthy();
    });
  });

  describe('success alert', async () => {
    it('should show success banner when a mandatory training is saved', async () => {
      const { component, alertSpy, fixture, getByLabelText, getByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[0].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Mandatory training category added',
      });
    });

    it('should show update banner when a mandatory training is saved', async () => {
      const { component, alertSpy, fixture, getByLabelText, getByText } = await setup(true);

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[0].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Mandatory training category updated',
      });
    });
  });

  describe('navigation', async () => {
    it('should navigate to add and manage mandatory training categories when a record is saved ', async () => {
      const { component, routerSpy, fixture, getByLabelText, getByText } = await setup();

      const mandatoryTrainigCategorySelect = getByLabelText('Training category', { exact: false });
      fireEvent.change(mandatoryTrainigCategorySelect, { target: { value: 1 } });

      const allJobRolesRadioButton = getByLabelText(component.allOrSelectedJobRoleOptions[0].label);
      fireEvent.click(allJobRolesRadioButton);

      fixture.detectChanges();

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.establishment.uid,
        'add-and-manage-mandatory-training',
      ]);
    });

    it('should navigate to add and manage mandatory training categories when a record is updated ', async () => {
      const { component, routerSpy, getByText } = await setup(true);

      const submitButton = getByText('Save and return');
      fireEvent.click(submitButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.establishment.uid,
        'add-and-manage-mandatory-training',
      ]);
    });
  });
});
