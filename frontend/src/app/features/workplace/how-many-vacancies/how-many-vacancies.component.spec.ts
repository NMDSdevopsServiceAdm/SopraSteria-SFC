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
import { render, screen } from '@testing-library/angular';
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
    spyOn(localStorage, 'getItem').and.returnValue(localStorageData);

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
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateJobsSpy = spyOn(establishmentService, 'updateJobs').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      routerSpy,
      updateJobsSpy,
      ...renderResults,
    };
  };

  const getInputBoxForJobRole = (jobTitle: string): HTMLInputElement => {
    return screen.getByRole('spinbutton', { name: 'Number of vacancies for ' + jobTitle });
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

  describe('prefill', () => {
    it('should prefill any job roles number that are brought along from previous page', async () => {
      const mockSelectedJobRoles = [
        {
          jobId: 10,
          title: 'Care worker',
          total: 3,
        },
        {
          jobId: 23,
          title: 'Registered nurse',
          total: null,
        },
      ];
      await setup({ selectedJobRoles: mockSelectedJobRoles });

      expect(getInputBoxForJobRole('Care worker').value).toEqual('3');
      expect(getInputBoxForJobRole('Registered nurse').value).toEqual('');
    });

    it('should navigate to "Do you have vacancies" page if failed to retrieve data from previous page', async () => {
      const { component, routerSpy } = await setup({ selectedJobRoles: 'some invalid data' });
      component.loadSelectedJobRoles();
      expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'do-you-have-vacancies']);
    });
  });

  describe('form submit and validations', () => {
    describe('on Success', () => {
      it('should call updateJobs with the input vacancies number', async () => {
        const { component, getByRole, updateJobsSpy } = await setup();

        userEvent.type(getInputBoxForJobRole('Care worker'), '2');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '4');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        expect(updateJobsSpy).toHaveBeenCalledWith(component.establishment.uid, {
          vacancies: [
            { jobId: 10, total: 2 },
            { jobId: 23, total: 4 },
          ],
        });
      });

      it('should navigate to the starters page if in the flow', async () => {
        const { component, getByRole, routerSpy } = await setup();

        userEvent.type(getInputBoxForJobRole('Care worker'), '2');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '4');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'starters']);
      });

      it('should navigate to workplace summary page if not in the flow', async () => {
        const { getByRole, routerSpy } = await setup({ returnToUrl: '/dashboard#workplace' });

        userEvent.type(getInputBoxForJobRole('Care worker'), '2');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '4');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
      });
    });

    describe('errors', () => {
      it('should show an error message if number input box is empty', async () => {
        const { fixture, getByRole, getByText, getAllByText, updateJobsSpy } = await setup();

        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText('Enter the number of vacancies (care worker)')).toHaveSize(2);
        expect(getAllByText('Enter the number of vacancies (registered nurse)')).toHaveSize(2);

        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should show an error message if the input number is out of range', async () => {
        const { fixture, getByRole, getByText, getAllByText, updateJobsSpy } = await setup();

        userEvent.type(getInputBoxForJobRole('Care worker'), '-10');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '99999');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText('Number of vacancies must be between 1 and 999 (care worker)')).toHaveSize(2);
        expect(getAllByText('Number of vacancies must be between 1 and 999 (registered nurse)')).toHaveSize(2);

        expect(updateJobsSpy).not.toHaveBeenCalled();
      });
    });
  });
});
