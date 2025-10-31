import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ServiceUsersService } from '@core/services/service-users.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { QuestionComponent } from '@features/workers/question/question.component';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { ServiceUsersComponent } from './service-users.component';

const mockServiceUser = [
  {
    group: 'Older people',
    services: [
      {
        id: 1,
        service: 'Older people with dementia',
      },
      {
        id: 2,
        service: 'Older people with mental disorders or infirmities, excluding learning disability or dementia',
      },
      {
        id: 3,
        service: 'Older people detained under the Mental Health Act',
      },
      {
        id: 4,
        service: 'Older people with learning disabilities and/or autism',
      },
      {
        id: 5,
        service: 'Older people with physical disabilities',
      },
      {
        id: 6,
        service: 'Older people with sensory impairment(s)',
      },
      {
        id: 7,
        service: 'Older people who misuse alcohol/drugs',
      },
      {
        id: 8,
        service: 'Older people with an eating disorder',
      },
      {
        id: 9,
        service: 'Older people not in above categories',
        other: true,
      },
    ],
  },
];

describe('ServiceUsersComponent', () => {
  const setup = async (overrides: any = {}) => {
    const getServiceUsersSpy = jasmine.createSpy('getServiceUsers').and.returnValue(of(mockServiceUser));

    const setupTools = await render(ServiceUsersComponent, {
      imports: [BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
        },
        {
          provide: ServiceUsersService,
          useValue: { getServiceUsers: getServiceUsersSpy },
        },
        UntypedFormBuilder,
        ErrorSummaryService,
        SubmitButtonComponent,
        QuestionComponent,
      provideHttpClient(), provideHttpClientTesting(),],
    });
    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { ...setupTools, component, routerSpy };
  };

  it('should render an ServiceUsersComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the section, the question but not the progress bar when not in the flow', async () => {
    const { getByText, getByTestId, queryByTestId } = await setup();

    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByText('Who are your service users?')).toBeTruthy();
    expect(queryByTestId('progress-bar')).toBeFalsy();
  });

  it('should render the progress bar when in the flow', async () => {
    const { getByTestId } = await setup({ returnToUrl: null });

    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  describe(`'Save and continue' and skip question`, () => {
    it(`should show 'Save and continue' cta button and 'Skip this question' link`, async () => {
      const { getByText } = await setup({ returnToUrl: null });

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should call the setSubmitAction function with an action of skip and save as false when clicking 'Skip this question' link`, async () => {
      const { component, getByText } = await setup({ returnToUrl: null });

      const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'skip', save: false });
    });

    describe('Navigating to next page', () => {
      const overridesWithCannotDoDHA = {
        returnToUrl: null,
        establishment: {
          mainService: {
            canDoDelegatedHealthcareActivities: null,
            id: 11,
            name: 'Domestic services and home help',
            reportingID: 10,
          },
        },
      };

      const overridesWithCanDoDHA = {
        returnToUrl: null,
        establishment: {
          mainService: {
            canDoDelegatedHealthcareActivities: true,
            id: 9,
            name: 'Day care and day services',
            reportingID: 6,
          },
        },
      };

      it('should navigate to do-you-have-vacancies page when user skips and establishment has main service which cannot do delegated healthcare activities', async () => {
        const { getByText, routerSpy } = await setup(overridesWithCannotDoDHA);

        const link = getByText('Skip this question');
        fireEvent.click(link);

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'do-you-have-vacancies']);
      });

      it('should navigate to do-you-have-vacancies page when user submits and establishment has main service which cannot do delegated healthcare activities', async () => {
        const { getByText, routerSpy } = await setup(overridesWithCannotDoDHA);

        const link = getByText('Save and continue');
        fireEvent.click(link);

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'do-you-have-vacancies']);
      });

      it('should navigate to staff-do-delegated-healthcare-activities page when user skips and establishment has main service which can do delegated healthcare activities', async () => {
        const { getByText, routerSpy } = await setup(overridesWithCanDoDHA);

        const link = getByText('Skip this question');
        fireEvent.click(link);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-do-delegated-healthcare-activities',
        ]);
      });

      it('should navigate to staff-do-delegated-healthcare-activities page when user submits and establishment has main service which can do delegated healthcare activities', async () => {
        const { getByText, routerSpy } = await setup(overridesWithCanDoDHA);

        const link = getByText('Save and continue');
        fireEvent.click(link);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          'mocked-uid',
          'staff-do-delegated-healthcare-activities',
        ]);
      });
    });
  });
});