import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Starter } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { HowManyStartersComponent } from './how-many-starters.component';

describe('HowManyStartersComponent', () => {
  const mockSelectedJobRoles: Starter[] = [
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
    const returnToUrl = override.returnToUrl ?? false;
    const availableJobs = override.availableJobs;
    const workplace = override.workplace ?? {};

    const selectedJobRoles = override.selectedJobRoles ?? mockSelectedJobRoles;
    const localStorageData = override.noLocalStorageData
      ? null
      : JSON.stringify({ establishmentUid: 'mock-uid', starters: selectedJobRoles });

    spyOn(localStorage, 'getItem').and.returnValue(localStorageData);

    const renderResults = await render(HowManyStartersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnToUrl, workplace),
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
      router,
      routerSpy,
      updateJobsSpy,
      ...renderResults,
    };
  };

  const getInputBoxForJobRole = (jobTitle: string): HTMLInputElement => {
    return screen.getByRole('spinbutton', { name: 'Number of new starters for ' + jobTitle });
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

      expect(heading.textContent).toEqual(
        'How many new starters have you had for each job role in the last 12 months?',
      );
      expect(sectionHeading.textContent).toEqual('Vacancies and turnover');
    });

    it('should render a reveal text to explain why we ask for this information', async () => {
      const { getByText } = await setup();
      const revealText = getByText('Why we ask for this information');

      expect(revealText).toBeTruthy();
      userEvent.click(revealText);

      const revealTextContent =
        "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";
      expect(getByText(revealTextContent)).toBeTruthy();
    });

    describe('starters numbers input form', () => {
      it('should render a input box for each selected job roles', async () => {
        const { getByText, getByRole } = await setup();

        mockSelectedJobRoles.forEach((role) => {
          expect(getByText(role.title)).toBeTruthy();
          const numberInput = getByRole('spinbutton', { name: 'Number of new starters for ' + role.title });
          expect(numberInput).toBeTruthy();
        });
      });

      it('should show the job role title together with additonal optional text if given', async () => {
        const selectedJobRoles = [
          {
            jobId: 20,
            title: 'Other (directly involved in providing care)',
            other: 'Special care worker',
            total: null,
          },
        ];
        const { getByText } = await setup({ selectedJobRoles });

        const expectedText = 'Other (directly involved in providing care): Special care worker';
        expect(getByText(expectedText)).toBeTruthy();
      });
    });
  });

  describe('buttons', () => {
    it('should render a "Save and continue" CTA button when in the flow', async () => {
      const { getByRole } = await setup();
      expect(getByRole('button', { name: 'Save and continue' })).toBeTruthy();
    });

    it('should render a "Save and return" CTA button when not in the flow', async () => {
      const { getByRole } = await setup({ returnToUrl: true });
      expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();
    });

    it('should render a "Cancel" button when not in the flow', async () => {
      const { getByText } = await setup({ returnToUrl: true });
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
      const { getByTestId, queryByTestId } = await setup({ returnToUrl: true });

      expect(getByTestId('section-heading')).toBeTruthy();
      expect(queryByTestId('progress-bar')).toBeFalsy();
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

      const { getByTestId } = await setup({ selectedJobRoles: mockSelectedJobRoles });

      expect(getInputBoxForJobRole('Care worker').value).toEqual('3');
      expect(getInputBoxForJobRole('Registered nurse').value).toEqual('');
      expect(getByTestId('total-number').innerText).toEqual('3');
    });

    it('should prefill job roles from workplace when not in local storage (when user has submitted previously and gone back to third page)', async () => {
      const mockSelectedJobRole = {
        jobId: 4,
        title: 'Allied health professional (not occupational therapist)',
        total: 6,
      };

      const { getByTestId } = await setup({
        noLocalStorageData: true,
        workplace: { starters: [mockSelectedJobRole] },
      });

      expect(getInputBoxForJobRole(mockSelectedJobRole.title).value).toEqual('6');
      expect(getByTestId('total-number').innerText).toEqual('6');
    });
  });

  describe('form submit and validations', () => {
    describe('on Success', () => {
      it('should call updateJobs with the input new starters number', async () => {
        const { component, getByRole, updateJobsSpy } = await setup();

        userEvent.type(getInputBoxForJobRole('Care worker'), '2');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '4');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        expect(updateJobsSpy).toHaveBeenCalledWith(component.establishment.uid, {
          starters: [
            { jobId: 10, total: 2 },
            { jobId: 23, total: 4 },
          ],
        });
      });

      it('should navigate to the do-you-have-leavers page if in the flow', async () => {
        const { component, getByRole, routerSpy } = await setup();

        userEvent.type(getInputBoxForJobRole('Care worker'), '2');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '4');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'do-you-have-leavers']);
      });

      it('should navigate to workplace summary page if not in the flow', async () => {
        const { getByRole, routerSpy } = await setup({ returnToUrl: true });

        userEvent.type(getInputBoxForJobRole('Care worker'), '2');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '4');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
      });

      it('should navigate to funding summary page if not in the flow and visited from funding page', async () => {
        const { component, getByRole, routerSpy } = await setup({ returnToUrl: true });
        component.return = { url: ['/funding', 'workplaces', 'mock-uid'] };

        userEvent.type(getInputBoxForJobRole('Care worker'), '2');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '4');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(routerSpy).toHaveBeenCalledWith(['/funding', 'workplaces', 'mock-uid'], jasmine.anything());
      });

      it('should clear the cache data in local storage after submit', async () => {
        const { getByRole } = await setup({ returnToUrl: true });
        const localStorageSpy = spyOn(localStorage, 'removeItem');

        userEvent.type(getInputBoxForJobRole('Care worker'), '2');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '4');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(localStorageSpy).toHaveBeenCalled();
      });
    });

    describe('errors', () => {
      it('should show an error message if number input box is empty', async () => {
        const { fixture, getByRole, getByText, getByTestId, updateJobsSpy } = await setup();

        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        const errorSummaryBox = getByText('There is a problem').parentElement;
        expect(within(errorSummaryBox).getByText('Enter the number of new starters (care worker)')).toBeTruthy();
        expect(within(errorSummaryBox).getByText('Enter the number of new starters (registered nurse)')).toBeTruthy();

        const numberInputsTable = getByTestId('number-inputs-table');
        expect(within(numberInputsTable).getAllByText('Enter the number of new starters')).toHaveSize(2);

        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should show an error message if the input number is out of range', async () => {
        const { fixture, getByRole, getByText, getByTestId, updateJobsSpy } = await setup();

        userEvent.type(getInputBoxForJobRole('Care worker'), '-10');
        userEvent.type(getInputBoxForJobRole('Registered nurse'), '99999');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        const errorSummaryBox = getByText('There is a problem').parentElement;
        expect(
          within(errorSummaryBox).getByText('Number of new starters must be between 1 and 999 (care worker)'),
        ).toBeTruthy();
        expect(
          within(errorSummaryBox).getByText('Number of new starters must be between 1 and 999 (registered nurse)'),
        ).toBeTruthy();

        const numberInputsTable = getByTestId('number-inputs-table');
        expect(within(numberInputsTable).getAllByText('Number of new starters must be between 1 and 999')).toHaveSize(
          2,
        );

        expect(updateJobsSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('navigation', async () => {
    it('should navigate to "Do you have starters" page if failed to load selected job roles data', async () => {
      const { component, routerSpy } = await setup({ selectedJobRoles: '[]' });
      component.loadSelectedJobRoles();
      expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'do-you-have-starters']);
    });

    describe('backlink', () => {
      it('should set the backlink to job role selection page', async () => {
        const { component } = await setup();
        expect(component.back).toEqual({
          url: ['/workplace', component.establishment.uid, 'select-starter-job-roles'],
        });
      });

      it('should set the backlink to job role selection page when not in the flow', async () => {
        const { component } = await setup({ returnToUrl: '/dashboard#workplace' });
        expect(component.back).toEqual({
          url: ['/workplace', component.establishment.uid, 'select-starter-job-roles'],
        });
      });
    });

    describe('cancel button', () => {
      it('should navigate to workplace summary page when cancel button is clicked', async () => {
        const { getByText, routerSpy } = await setup({ returnToUrl: '/dashboard#workplace' });

        userEvent.click(getByText('Cancel'));

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
      });

      it('should return to the funding workplace summary page when visited from funding and cancel button is clicked', async () => {
        const { component, getByText, routerSpy } = await setup({
          returnToUrl: true,
        });
        component.return = { url: ['/funding', 'workplaces', 'mock-uid'] };

        const cancelButton = getByText('Cancel');

        userEvent.click(cancelButton);
        expect(routerSpy).toHaveBeenCalledWith(['/funding', 'workplaces', 'mock-uid'], jasmine.anything());
      });

      it('should clear the cache data in local storage on cancel', async () => {
        const { getByText } = await setup({ returnToUrl: '/dashboard#workplace' });
        const localStorageSpy = spyOn(localStorage, 'removeItem');

        userEvent.click(getByText('Cancel'));

        expect(localStorageSpy).toHaveBeenCalledWith('hasStarters');
        expect(localStorageSpy).toHaveBeenCalledWith('startersJobRoles');
      });
    });
  });
});
