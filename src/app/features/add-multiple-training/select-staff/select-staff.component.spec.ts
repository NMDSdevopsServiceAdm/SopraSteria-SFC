import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { SelectStaffComponent } from './select-staff.component';

describe('SelectStaffComponent', () => {
  async function setup(preselectedStaff = ['1234']) {
    const component = await render(SelectStaffComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMultipleTrainingModule],
      providers: [
        BackService,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: TrainingService,
          useValue: {
            selectedStaff: preselectedStaff,
            updateSelectedStaff: () => {
              return true;
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      spy,
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
    const { component } = await setup(null);

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

    expect(spy).toHaveBeenCalledWith(['add-multiple-training', 'training-details']);
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
      const { component } = await setup(null);
      const form = component.fixture.componentInstance.form;

      form.value.selectStaff[0].checked = true;
      form.value.selectStaff[1].checked = true;
      form.value.selectStaff[2].checked = true;

      component.fixture.componentInstance.updateSelectAllCheckbox();

      expect(form.value.selectAll).toBeTruthy();
    });

    it('should automatically uncheck the `Select all` checkbox when at least one staff checkbox is unchecked', async () => {
      const { component } = await setup(null);
      const form = component.fixture.componentInstance.form;

      form.value.selectStaff[0].checked = true;
      form.value.selectStaff[1].checked = true;
      form.value.selectStaff[2].checked = false;

      component.fixture.componentInstance.updateSelectAllCheckbox();

      expect(form.value.selectAll).toBeFalsy();
    });
  });

  describe('setBackLink()', () => {
    it('should set the back link to the dashboard', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/dashboard'],
        fragment: 'training-and-qualifications',
      });
    });
  });
});
