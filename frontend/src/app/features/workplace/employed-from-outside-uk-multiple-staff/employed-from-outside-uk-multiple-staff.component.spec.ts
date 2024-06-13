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
  const workersWithHealthAndCareVisas = [
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

  async function setup() {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      EmployedFromOutsideUkMultipleStaffComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          AlertService,
          WindowRef,
          {
            provide: InternationalRecruitmentService,
            useValue: {
              getWorkersWithHealthAndCareVisaForWorkplace() {
                return of({ workersWithHealthAndCareVisas });
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

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      routerSpy,
    };
  }

  it('should render an EmployedFromOutsideUkMultipleStaffComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display names of workers returned from international recruitment API call', async () => {
    const { getByText } = await setup();

    expect(getByText(workersWithHealthAndCareVisas[0].nameOrId)).toBeTruthy();
    expect(getByText(workersWithHealthAndCareVisas[1].nameOrId)).toBeTruthy();
  });

  it('should navigate to worker staff record on click of name', async () => {
    const { getByText, routerSpy } = await setup();
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

  it('should navigate to home page after successful submit', async () => {
    const { getByText, routerSpy } = await setup();

    const saveButton = getByText('Save information');
    fireEvent.click(saveButton);

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
  });
});
