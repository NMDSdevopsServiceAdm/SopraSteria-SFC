import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { ConfirmStaffRecruitmentComponent } from './confirm-staff-recruitment.component';

describe('ConfirmStaffRecruitmentComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(ConfirmStaffRecruitmentComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkplaceModule],
      providers: [
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                establishment: {
                  uid: '1446-uid-54638',
                },
              },
            },
          }),
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const alert = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alert, 'addAlert');
    alertSpy.and.callThrough();

    const backService = injector.inject(BackService) as BackService;
    const backServiceSpy = spyOn(backService, 'setBackLink');
    backServiceSpy.and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      routerSpy,
      alertSpy,
      backServiceSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();
    expect(getByText('Staff recruitment')).toBeTruthy();
  });

  it('should display all questions', async () => {
    const { getByText } = await setup();

    expect(getByText('Advertising spend')).toBeTruthy();
    expect(getByText('People interviewed')).toBeTruthy();
    expect(getByText('Repeat training')).toBeTruthy();
    expect(getByText('Accept care certificate')).toBeTruthy();
  });

  it('should prefill the form with the current data from the establishment service', async () => {
    const { component } = await setup();

    expect(component.establishment.moneySpentOnAdvertisingInTheLastFourWeeks).toBe('78');
    expect(component.establishment.peopleInterviewedInTheLastFourWeeks).toBe('None');
    expect(component.establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment).toBe('No,never');
    expect(component.establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment).toBe('No,never');
  });
});
