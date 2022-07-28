import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StaffBenefitHolidayLeaveComponent } from './staff-benefit-holiday-leave.component';

describe('StaffBenefitHolidayLeaveComponent', () => {
  async function setup(returnUrl = true, holidayLeave = undefined) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      StaffBenefitHolidayLeaveComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: EstablishmentService,
            useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl, {
              careWorkersLeaveDaysPerYear: holidayLeave,
            }),
            deps: [HttpClient],
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateSingleEstablishmentField').and.callThrough();
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
      establishmentService,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  it('should render a StaffBenefitHolidayLeaveComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the headings', async () => {
    const { getByText } = await setup();
    const heading = 'How many days leave do your full-time care workers get each year?';
    const helpText =
      'Include bank holidays in the total. For example, 20 days annual leave plus 8 days bank holidays would be 28 days in total.';

    expect(getByText(heading)).toBeTruthy;
    expect(getByText(helpText)).toBeTruthy;
  });

  it('should prefill the input if the establishment has a cash loyalty value', async () => {
    const holidayLeave = '35';
    const { component, fixture } = await setup(true, holidayLeave);

    const input = fixture.nativeElement.querySelector('input[id="holidayLeave"]');

    expect(input.value).toEqual('35');
    expect(component.form.value).toEqual({ holidayLeave: '35' });
  });
});
