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
import { render } from '@testing-library/angular';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { SelectStaffComponent } from './select-staff.component';

describe('SelectStaffComponent', () => {
  async function setup() {
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
            selectedStaff: ['1234'],
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
