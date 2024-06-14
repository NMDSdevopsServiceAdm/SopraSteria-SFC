import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { WindowRef } from '@core/services/window.ref';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { EmployedFromOutsideUkMultipleStaffComponent } from './employed-from-outside-uk-multiple-staff.component';

describe('EmployedFromOutsideUkMultipleStaffComponent', () => {
  const workplaceUid = 'abcd13528233';
  const pluralWorkers = () => [
    {
      id: 123,
      uid: 'abc123',
      nameOrId: 'Bobby',
    },
    {
      id: 456,
      uid: 'abc456',
      nameOrId: 'Benny',
    },
  ];

  const singleWorker = () => [
    {
      id: 123,
      uid: 'abc123',
      nameOrId: 'Bobby',
    },
  ];

  async function setup(workers = pluralWorkers()) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      EmployedFromOutsideUkMultipleStaffComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          WindowRef,
          {
            provide: InternationalRecruitmentService,
            useValue: {
              getWorkersWithHealthAndCareVisaForWorkplace() {
                return of({ workersWithHealthAndCareVisas: workers });
              },
              getEmployedFromOutsideUkAnswers() {
                return [
                  {
                    tag: 'Outside the UK',
                    value: 'Yes',
                  },
                  {
                    tag: 'Inside the UK',
                    value: 'No',
                  },
                  {
                    tag: 'I do not know',
                    value: "Don't know",
                  },
                ];
              },
            },
          },
          {
            provide: EstablishmentService,
            useValue: { establishment: { uid: workplaceUid } },
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const alertService = injector.inject(AlertService) as AlertService;
    const addAlertSpy = spyOn(alertService, 'addAlert').and.callThrough();

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
    };
  }

  it('should render an EmployedFromOutsideUkMultipleStaffComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should display names of workers returned from international recruitment API call', async () => {
    const workersWithHealthAndCareVisas = pluralWorkers();
    const { getByText } = await setup(workersWithHealthAndCareVisas);

    expect(getByText(workersWithHealthAndCareVisas[0].nameOrId)).toBeTruthy();
    expect(getByText(workersWithHealthAndCareVisas[1].nameOrId)).toBeTruthy();
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
      const { getByText, routerSpy } = await setup(workersWithHealthAndCareVisas);
      const worker = workersWithHealthAndCareVisas[0];
      const workerLink = getByText(worker.nameOrId);

      fireEvent.click(workerLink);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceUid,
        'staff-record',
        worker.uid,
        'staff-record-summary',
      ]);
    });

    it('should navigate to home page and show banner after successful submit', async () => {
      const { fixture, getByText, routerSpy, addAlertSpy } = await setup();

      const saveButton = getByText('Save information');
      fireEvent.click(saveButton);

      await fixture.whenStable();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
      expect(addAlertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Health and Care  Worker visa information saved',
      });
    });

    it('should navigate to home page when you click Cancel link', async () => {
      const { getByText } = await setup();

      const cancelButton = getByText('Cancel');

      expect(cancelButton.getAttribute('href')).toBe('/dashboard#home');
    });
  });
});
