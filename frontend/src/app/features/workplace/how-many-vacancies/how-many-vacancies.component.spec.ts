import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Vacancy } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { HowManyVacanciesComponent } from './how-many-vacancies.component';

fdescribe('HowManyVacanciesComponent', () => {
  const mockSelectedJobRoles: Vacancy[] = [
    {
      jobId: 10,
      title: 'Care worker',
      total: null,
    },
    {
      jobId: 23,
      title: 'Registered nurse',
      total: null,
    },
  ];

  const setup = async (override: any = {}) => {
    const returnToUrl = override.returnToUrl ? override.returnToUrl : null;
    const availableJobs = override.availableJobs;

    const selectedJobRoles = override.selectedJobRoles ?? mockSelectedJobRoles;
    const localStorageData =
      override.localStorageData ?? JSON.stringify({ establishmentUid: 'mock-uid', vacancies: selectedJobRoles });
    const getLocalStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(localStorageData);

    const renderResults = await render(HowManyVacanciesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnToUrl, {}),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {},
              data: {
                jobs: availableJobs,
              },
            },
          },
        },
      ],
    });

    const component = renderResults.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      routerSpy,
      getLocalStorageSpy,
      ...renderResults,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display a heading and a section heading', async () => {
      const { getByRole } = await setup();
      const heading = getByRole('heading', { level: 1 });
      const sectionHeading = heading.previousSibling;

      expect(heading.textContent).toEqual('How many current staff vacancies do you have for each job role?');
      expect(sectionHeading.textContent).toEqual('Vacancies and turnover');
    });
  });

  it('should render a reveal text to explain why we ask for this information', async () => {
    const { getByText } = await setup();
    const revealText = getByText('Why we ask for this information');

    expect(revealText).toBeTruthy();
    userEvent.click(revealText);

    const revealTextContent =
      'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.';
    expect(getByText(revealTextContent)).toBeTruthy();
  });

  describe('vacancy numbers input form', () => {
    it('should render a input box for each selected job roles', async () => {
      const { getByText, getByRole } = await setup();

      mockSelectedJobRoles.forEach((role) => {
        expect(getByText(role.title)).toBeTruthy();
        const numberInput = getByRole('spinbutton', { name: 'Number of vacancies for ' + role.title });
        expect(numberInput).toBeTruthy();
      });
    });
  });

  describe('buttons', () => {
    it('should render a "Save and continue" CTA button when in the flow', async () => {
      const { getByRole } = await setup();
      expect(getByRole('button', { name: 'Save and continue' })).toBeTruthy();
    });

    it('should render a "Save and return" CTA button when not in the flow', async () => {
      const { getByRole } = await setup({ returnToUrl: '/dashboard#workplace' });
      expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();
    });

    it('should render a "Cancel" button when not in the flow', async () => {
      const { getByText } = await setup({ returnToUrl: '/dashboard#workplace' });
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should not render a "Skip this question" button', async () => {
      const { queryByText } = await setup();
      expect(queryByText('Skip this question')).toBeFalsy();
    });
  });

  describe('progress bar', () => {
    it('should render a progress bar when in the flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render a progress bar when not in the flow', async () => {
      const { getByTestId, queryByTestId } = await setup({ returnToUrl: '/dashboard#workplace' });

      expect(getByTestId('section-heading')).toBeTruthy();
      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });
});
