import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ServiceUsersService } from '@core/services/service-users.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { QuestionComponent } from '@features/workers/question/question.component';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, queryByText, render } from '@testing-library/angular';
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
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId } = await render(
      ServiceUsersComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
        providers: [
          { provide: BreadcrumbService, useClass: MockBreadcrumbService },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },

          UntypedFormBuilder,
          ErrorSummaryService,
          SubmitButtonComponent,
          QuestionComponent,
        ],
      },
    );
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const userServiceSpy = injector.inject(ServiceUsersService) as ServiceUsersService;
    spyOn(userServiceSpy, 'getServiceUsers').and.returnValue(of(mockServiceUser));
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId, routerSpy };
  };

  it('should render an ServiceUsersComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the section, the question but not the progress bar when not in the flow', async () => {
    const { getByText, getByTestId, queryByTestId, fixture, component } = await setup();
    component['init']();

    fixture.detectChanges();
    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByText('Who are your service users?')).toBeTruthy();
    expect(queryByTestId('progress-bar')).toBeFalsy();
  });

  it('should render the progress bar when in the flow', async () => {
    const { component, fixture, getByTestId } = await setup();
    component['init']();

    component.return = null;
    fixture.detectChanges();

    expect(getByTestId('progress-bar')).toBeTruthy();
  });

  describe(`'Save and continue' and skip question`, () => {
    it(`should show 'Save and continue' cta button and 'Skip this question' link`, async () => {
      const { getByText, component, fixture, queryByText } = await setup();
      component['init']();

      component.return = null;
      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should call the setSubmitAction function with an action of skip and save as false when clicking 'Skip this question' link`, async () => {
      const { component, fixture, getByText } = await setup();
      component['init']();

      const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

      component.return = null;
      fixture.detectChanges();

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'skip', save: false });
    });

    it('should navigate to the next page when skip the question', async () => {
      const { fixture, getByText, routerSpy, component } = await setup();
      component['init']();

      component.return = null;
      fixture.detectChanges();

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'vacancies']);
    });
  });
});
