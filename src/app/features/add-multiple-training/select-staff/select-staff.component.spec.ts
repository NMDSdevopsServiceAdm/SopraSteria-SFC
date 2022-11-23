import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingService, MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { AllWorkers } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { SelectStaffComponent } from './select-staff.component';

describe('SelectStaffComponent', () => {
  async function setup(preselectedStaff = true) {
    const component = await render(SelectStaffComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMultipleTrainingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: TrainingService,
          useClass: preselectedStaff ? MockTrainingServiceWithPreselectedStaff : MockTrainingService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workers: {
                  workers: AllWorkers,
                },
              },
              params: {
                establishmentuid: '1234-5678',
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const trainingService = injector.inject(TrainingService) as TrainingService;

    const trainingSpy = spyOn(trainingService, 'resetSelectedStaff');
    trainingSpy.and.callThrough();

    return {
      component,
      router,
      spy,
      trainingSpy,
    };
  }

  it('should render a SelectStaffComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should pre-check the checkboxes for staff that have already been selected', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;

    expect(form.value.selectStaff[0].workerUid).toEqual('1234');
    expect(form.value.selectStaff[0].checked).toEqual(true);
  });

  it('should display an error message when the continue button is pressed without selecting anything', async () => {
    const { component } = await setup(false);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(component.getAllByText('Select the staff who have completed the training').length).toEqual(3);
  });

  it('should store the selected staff in the training service when pressing continue', async () => {
    const { component } = await setup();
    const spy = spyOn(component.fixture.componentInstance.trainingService, 'updateSelectedStaff');

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['1234']);
  });

  it('should navigate to the training details page when pressing continue', async () => {
    const { component, spy } = await setup();

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['workplace', '1234-5678', 'add-multiple-training', 'training-details']);
  });

  describe('Select all checkbox', () => {
    it('should select all checkboxes when `Select all` is checked', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;

      const selectAllCheckbox = component.getByText('Select all');
      fireEvent.click(selectAllCheckbox);

      form.value.selectStaff.forEach((worker) => {
        expect(worker.checked).toEqual(true);
      });
    });

    it('should deselect all checkboxes when `Select all` is unchecked', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;

      const selectAllCheckbox = component.getByText('Select all');
      fireEvent.click(selectAllCheckbox);
      form.value.selectStaff.forEach((worker) => {
        expect(worker.checked).toEqual(true);
      });

      fireEvent.click(selectAllCheckbox);
      form.value.selectStaff.forEach((worker) => {
        expect(worker.checked).toEqual(false);
      });
    });

    it('should automatically check the `Select all` checkbox when all staff are selected manually', async () => {
      const { component } = await setup(false);
      const form = component.fixture.componentInstance.form;

      form.value.selectStaff[0].checked = true;
      form.value.selectStaff[1].checked = true;
      form.value.selectStaff[2].checked = true;

      component.fixture.componentInstance.updateSelectAllCheckbox();

      expect(component.fixture.componentInstance.selectAll).toBeTruthy();
    });

    it('should automatically uncheck the `Select all` checkbox when at least one staff checkbox is unchecked', async () => {
      const { component } = await setup(false);
      const form = component.fixture.componentInstance.form;

      form.value.selectStaff[0].checked = true;
      form.value.selectStaff[1].checked = true;
      form.value.selectStaff[2].checked = false;

      component.fixture.componentInstance.updateSelectAllCheckbox();

      expect(component.fixture.componentInstance.selectAll).toBeFalsy();
    });
  });

  describe('onCancel()', () => {
    it('should reset selected staff in training service and navigate to dashboard if primary user', async () => {
      const { component, spy, trainingSpy } = await setup();

      component.fixture.componentInstance.primaryWorkplaceUid = '1234-5678';
      component.fixture.componentInstance.setReturnLink();
      component.fixture.detectChanges();

      const cancelButton = component.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(trainingSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
    });

    it(`should reset selected staff in training service and navigate to subsidiary's dashboard if not primary user`, async () => {
      const { component, spy, trainingSpy } = await setup();

      component.fixture.componentInstance.primaryWorkplaceUid = '5678-9001';
      component.fixture.componentInstance.setReturnLink();
      component.fixture.detectChanges();

      const cancelButton = component.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(trainingSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(['/workplace', '1234-5678'], { fragment: 'training-and-qualifications' });
    });
  });

  describe('setReturnLink', () => {
    it('should set returnLink to the dashboard if the establishment uid is the same as the primary uid', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.primaryWorkplaceUid = '1234-5678';
      component.fixture.componentInstance.setReturnLink();
      component.fixture.detectChanges();

      expect(component.fixture.componentInstance.returnLink).toEqual(['/dashboard']);
    });

    it(`should set returnLink to the subsidiary's dashboard if the establishment uid is not the same as the primary uid`, async () => {
      const { component } = await setup();

      component.fixture.componentInstance.primaryWorkplaceUid = '5678-9001';
      component.fixture.componentInstance.setReturnLink();
      component.fixture.detectChanges();

      expect(component.fixture.componentInstance.returnLink).toEqual(['/workplace', '1234-5678']);
    });
  });
});
