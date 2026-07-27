import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockInternationalRecruitmentService } from '@core/test-utils/MockInternationalRecruitmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { EmployedFromOutsideUkExistingWorkersComponent } from './employed-from-outside-uk-existing-workers.component';

describe('EmployedFromOutsideUkExistingWorkersComponent', () => {
  const pluralWorkers = () => [
    {
      id: 123,
      uid: 'abc123',
      name: 'Bobby',
      healthAndCareVisa: 'Yes',
      employedFromOutsideUk: null,
    },
    {
      id: 456,
      uid: 'abc456',
      name: 'Benny',
      healthAndCareVisa: 'Yes',
      employedFromOutsideUk: null,
    },
  ];

  const pluralWorkersWithWorkersWithoutHealthCareVisa = () => [
    ...pluralWorkers(),
    {
      id: 789,
      uid: 'abc789',
      name: 'Andrew',
      healthAndCareVisa: 'No',
      employedFromOutsideUk: null,
    },
    {
      id: 789,
      uid: 'def123',
      name: 'David',
      healthAndCareVisa: "Don't know",
      employedFromOutsideUk: null,
    },
  ];

  const singleWorker = () => [
    {
      id: 123,
      uid: 'abc123',
      name: 'Bobby',
      healthAndCareVisa: 'Yes',
      employedFromOutsideUk: null,
    },
  ];

  async function setup(workers = pluralWorkers()) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId, queryByText } = await render(
      EmployedFromOutsideUkExistingWorkersComponent,
      {
        imports: [SharedModule, RouterModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          WindowRef,
          {
            provide: InternationalRecruitmentService,
            useFactory: MockInternationalRecruitmentService.factory(false, {
              workplaceUid: 'mocked-uid',
              healthAndCareVisaWorkerAnswers: workers,
            }),
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = injector.inject(AlertService) as AlertService;
    const addAlertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateWorkersSpy = spyOn(establishmentService, 'updateWorkers').and.returnValue(of(null));

    const backService = injector.inject(BackService) as BackService;
    const backLinkSpy = spyOn(backService, 'setBackLink');

    const internationalRecruitmentService = injector.inject(
      InternationalRecruitmentService,
    ) as InternationalRecruitmentService;
    const setInternationalRecruitmentWorkerAnswersSpy = spyOn(
      internationalRecruitmentService,
      'setInternationalRecruitmentWorkerAnswers',
    );

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      routerSpy,
      addAlertSpy,
      updateWorkersSpy,
      queryByText,
      backLinkSpy,
      setInternationalRecruitmentWorkerAnswersSpy,
    };
  }

  it('should render an EmployedFromOutsideUkExistingWorkersComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should display names of workers returned from international recruitment service with health and care visas', async () => {
    const workersWithHealthAndCareVisas = pluralWorkersWithWorkersWithoutHealthCareVisa();
    const { getByText } = await setup(workersWithHealthAndCareVisas);

    expect(getByText(workersWithHealthAndCareVisas[0].name)).toBeTruthy();
    expect(getByText(workersWithHealthAndCareVisas[1].name)).toBeTruthy();
  });

  it('should not display names of workers returned from international recruitment service which do not have health and care visa', async () => {
    const workers = pluralWorkersWithWorkersWithoutHealthCareVisa();
    const { queryByText } = await setup(workers);

    expect(queryByText(workers[2].name)).toBeFalsy();
    expect(queryByText(workers[3].name)).toBeFalsy();
  });

  it('should render the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      'DHSC use the anonymised data to help them identify which roles workers with Health and Care Worker visas have. The data is also used to look at employment trends and inform recruitment policies.',
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
  });

  it('should set the existing staff health and care visa page as back link', async () => {
    const { component, backLinkSpy } = await setup();

    component.setBackLink();

    expect(backLinkSpy).toHaveBeenCalledWith({
      url: ['/workplace', component.workplaceUid, 'health-and-care-visa-existing-workers'],
    });
  });

  describe('On submit, ', () => {
    it('should call updateWorkers with database value of selected answer when answer given for single worker', async () => {
      const workers = singleWorker();

      const { component, fixture, getByText, updateWorkersSpy } = await setup(workers);

      const outsideTheUk = fixture.nativeElement.querySelector('input[id="workers-insideOutsideUk-0-0"]');
      const saveButton = getByText('Save information');

      fireEvent.click(outsideTheUk);
      fireEvent.click(saveButton);

      expect(updateWorkersSpy).toHaveBeenCalledWith(component.workplaceUid, [
        {
          uid: workers[0].uid,
          employedFromOutsideUk: 'Yes',
          healthAndCareVisa: 'Yes',
        },
      ]);
    });

    it('should call updateWorkers with database value of selected answers and healthAndCareVisa value when answer given for all workers', async () => {
      const workers = pluralWorkers();

      const { component, fixture, getByText, updateWorkersSpy } = await setup(workers);

      const outsideTheUkWorker1 = fixture.nativeElement.querySelector('input[id="workers-insideOutsideUk-0-0"]');
      const insideTheUkWorker2 = fixture.nativeElement.querySelector('input[id="workers-insideOutsideUk-1-1"]');
      const saveButton = getByText('Save information');

      fireEvent.click(outsideTheUkWorker1);
      fireEvent.click(insideTheUkWorker2);
      fireEvent.click(saveButton);

      expect(updateWorkersSpy).toHaveBeenCalledWith(component.workplaceUid, [
        {
          uid: workers[0].uid,
          employedFromOutsideUk: 'Yes',
          healthAndCareVisa: 'Yes',
        },
        {
          uid: workers[1].uid,
          employedFromOutsideUk: 'No',
          healthAndCareVisa: 'Yes',
        },
      ]);
    });

    it('should call updateWorkers without employedFromOutsideUk when no answer provided before submitting', async () => {
      const workers = pluralWorkers();

      const { component, getByText, updateWorkersSpy } = await setup(workers);

      const saveButton = getByText('Save information');

      fireEvent.click(saveButton);

      expect(updateWorkersSpy).toHaveBeenCalledWith(component.workplaceUid, [
        {
          uid: workers[0].uid,
          healthAndCareVisa: 'Yes',
        },
        {
          uid: workers[1].uid,
          healthAndCareVisa: 'Yes',
        },
      ]);
    });

    it('should call updateWorkers without employedFromOutsideUk for unanswered worker and with employedFromOutsideUk for answered worker', async () => {
      const workers = pluralWorkers();

      const { fixture, component, getByText, updateWorkersSpy } = await setup(workers);

      const insideTheUkWorker2 = fixture.nativeElement.querySelector('input[id="workers-insideOutsideUk-1-1"]');
      const saveButton = getByText('Save information');

      fireEvent.click(insideTheUkWorker2);
      fireEvent.click(saveButton);

      expect(updateWorkersSpy).toHaveBeenCalledWith(component.workplaceUid, [
        {
          uid: workers[0].uid,
          healthAndCareVisa: 'Yes',
        },
        {
          uid: workers[1].uid,
          healthAndCareVisa: 'Yes',
          employedFromOutsideUk: 'No',
        },
      ]);
    });

    it('should include workers who do not have H and C visas in IR service in call to updateWorkers without employedFromOutsideUk', async () => {
      const workers = pluralWorkersWithWorkersWithoutHealthCareVisa();

      const { component, fixture, getByText, updateWorkersSpy } = await setup(workers);

      const outsideTheUkWorker1 = fixture.nativeElement.querySelector('input[id="workers-insideOutsideUk-0-0"]');
      const insideTheUkWorker2 = fixture.nativeElement.querySelector('input[id="workers-insideOutsideUk-1-1"]');
      const saveButton = getByText('Save information');

      fireEvent.click(outsideTheUkWorker1);
      fireEvent.click(insideTheUkWorker2);
      fireEvent.click(saveButton);

      expect(updateWorkersSpy).toHaveBeenCalledWith(component.workplaceUid, [
        {
          uid: workers[0].uid,
          employedFromOutsideUk: 'Yes',
          healthAndCareVisa: 'Yes',
        },
        {
          uid: workers[1].uid,
          employedFromOutsideUk: 'No',
          healthAndCareVisa: 'Yes',
        },
        {
          uid: workers[2].uid,
          healthAndCareVisa: 'No',
        },
        {
          uid: 'def123',
          healthAndCareVisa: "Don't know",
        },
      ]);
    });

    it('should navigate to home page and show banner after successful submit', async () => {
      const workers = singleWorker();

      const { fixture, getByText, routerSpy, addAlertSpy } = await setup(workers);

      const outsideTheUk = fixture.nativeElement.querySelector('input[id="workers-insideOutsideUk-0-0"]');
      const saveButton = getByText('Save information');

      fireEvent.click(outsideTheUk);
      fireEvent.click(saveButton);

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
      expect(addAlertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Health and Care  Worker visa information saved',
      });
    });

    it('should reset the international recruitment answers in the service on submit', async () => {
      const { getByText, setInternationalRecruitmentWorkerAnswersSpy } = await setup();

      const saveButton = getByText('Save information');
      fireEvent.click(saveButton);

      expect(setInternationalRecruitmentWorkerAnswersSpy).toHaveBeenCalledWith(null);
    });

    describe('On server error, ', () => {
      [400, 404, 503].forEach((errorCode) => {
        it(`should display server error message when ${errorCode} error returned from updateWorkers`, async () => {
          const workers = singleWorker();

          const { fixture, getByText, updateWorkersSpy } = await setup(workers);
          updateWorkersSpy.and.returnValue(throwError(new HttpErrorResponse({ status: 404 })));

          const saveButton = getByText('Save information');

          fireEvent.click(saveButton);
          fixture.detectChanges();

          const errorMessage = 'There has been a problem saving your Health and Care visa data. Please try again.';

          expect(getByText(errorMessage)).toBeTruthy();
        });
      });
    });
  });

  describe('Pluralisation of title question', () => {
    it('should display title question in plural when more than one worker', async () => {
      const { getByText } = await setup();

      expect(
        getByText('Did your organisation employ these workers from outside the UK or from inside the UK?'),
      ).toBeTruthy();
    });

    it('should display title question in singular when one worker', async () => {
      const { getByText } = await setup(singleWorker());

      expect(
        getByText('Did your organisation employ this worker from outside the UK or from inside the UK?'),
      ).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to worker staff record on click of name', async () => {
      const workersWithHealthAndCareVisas = pluralWorkers();
      const { component, getByText, routerSpy } = await setup(workersWithHealthAndCareVisas);
      const worker = workersWithHealthAndCareVisas[0];
      const workerLink = getByText(worker.name);

      fireEvent.click(workerLink);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplaceUid,
        'staff-record',
        worker.uid,
        'staff-record-summary',
      ]);
    });

    it('should navigate to home page when you click Cancel link', async () => {
      const { getByText } = await setup();

      const cancelButton = getByText('Cancel');

      expect(cancelButton.getAttribute('href')).toBe('/dashboard#home');
    });
  });
});
