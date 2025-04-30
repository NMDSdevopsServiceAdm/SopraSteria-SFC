import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment, jobOptionsEnum, Leaver } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService, WorkplaceUpdatePage } from '@core/services/vacancies-and-turnover.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { FormatUtil } from '@core/utils/format-util';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

import { UpdateLeaversComponent } from './update-leavers.component';

describe('UpdateLeaversComponent', () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 1);

  const todayOneYearAgo = FormatUtil.formatDateToLocaleDateString(today);

  const radioButtonLabels = {
    NONE: `No staff left on or after ${todayOneYearAgo}`,
    DONT_KNOW: `I do not know if any staff left on or after ${todayOneYearAgo}`,
  };

  const mockLeavers: Leaver[] = [
    {
      jobId: 10,
      title: 'Care worker',
      total: 2,
    },
    {
      jobId: 23,
      title: 'Registered nurse',
      total: 2,
    },
  ];

  const mockWorkplace = establishmentBuilder({
    overrides: { leavers: null },
  });

  const mockWorkplaceWithLeavers = establishmentBuilder({
    overrides: { leavers: mockLeavers },
  });

  const selectedJobRoles = [
    {
      jobId: 25,
      title: 'Senior care worker',
      total: 1,
    },
  ];

  const totalJobRoles = (jobRoles: any) => {
    let total = 0;

    for (const i in jobRoles) {
      total += jobRoles[i].total;
    }
    return total;
  };

  const setup = async (override: any = {}) => {
    const selectedLeavers = override.leaversFromSelectJobRolePages ?? null;
    const workplace = override.workplace ?? mockWorkplace;
    const addToVisitedPagesSpy = jasmine.createSpy('addToVisitedPages');
    const addToSubmittedPagesSpy = jasmine.createSpy('addToSubmittedPages');

    const setupTools = await render(UpdateLeaversComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: override.snapshot },
          },
        },
        {
          provide: VacanciesAndTurnoverService,
          useFactory: MockVacanciesAndTurnoverService.factory({
            selectedLeavers,
            addToVisitedPages: addToVisitedPagesSpy,
            addToSubmittedPages: addToSubmittedPagesSpy,
          }),
        },
        {
          provide: EstablishmentService,
          useValue: {
            establishment: workplace,
            updateJobs: () => {},
            setState: () => {},
            ...override.establishmentService,
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const vacanciesAndTurnoverService = injector.inject(VacanciesAndTurnoverService) as VacanciesAndTurnoverService;

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateJobsSpy = spyOn(establishmentService, 'updateJobs').and.callFake((uid, data) =>
      of({ uid, leavers: data.leavers }),
    );

    return {
      ...setupTools,
      component,
      routerSpy,
      vacanciesAndTurnoverService,
      updateJobsSpy,
      addToVisitedPagesSpy,
      addToSubmittedPagesSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should add page to visitedPages in vacanciesAndTurnoverService', async () => {
    const { addToVisitedPagesSpy } = await setup();

    expect(addToVisitedPagesSpy).toHaveBeenCalledWith(WorkplaceUpdatePage.UPDATE_LEAVERS);
  });

  describe('page heading', () => {
    it('should show for adding leavers', async () => {
      const { getByRole } = await setup({ workplace: mockWorkplace });

      const heading = getByRole('heading', { level: 1 });

      expect(heading.textContent).toEqual(`Add the number of staff who've left SINCE ${todayOneYearAgo}`);
    });

    it('should show for updating leavers', async () => {
      const { getByRole } = await setup({ workplace: mockWorkplaceWithLeavers });

      const heading = getByRole('heading', { level: 1 });

      expect(heading.textContent).toEqual(`Update the number of staff who've left SINCE ${todayOneYearAgo}`);
    });
  });

  it("should show the reveal text for 'Why we ask for this information'", async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      'To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions.',
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
  });

  describe('warning icon and text', () => {
    it('should show when it has been previously answered', async () => {
      const { getByTestId } = await setup({ workplace: mockWorkplaceWithLeavers });

      const warningTextId = getByTestId('warning-text');
      const warningTextContent = `Remember to SUBTRACT or REMOVE any staff who left before ${todayOneYearAgo}`;

      expect(warningTextId.textContent).toContain(warningTextContent);
    });

    it('should not show when it has not been previously answered', async () => {
      const { queryByTestId } = await setup({ workplace: mockWorkplace });

      const warningTextId = queryByTestId('warning-text');

      expect(warningTextId).toBeFalsy();
    });
  });

  describe('add explanation message', () => {
    it('should show when question has not been answered previously', async () => {
      const { getByText } = await setup({ workplace: mockWorkplace });

      const addMessage = getByText('Only add the number of leavers who left permanent and temporary job roles.');

      expect(addMessage).toBeTruthy();
    });

    it('should not show when question has been answered previously', async () => {
      const { queryByText } = await setup({ workplace: mockWorkplaceWithLeavers });

      const addMessage = queryByText('Only add the number of leavers who left permanent and temporary job roles.');

      expect(addMessage).toBeFalsy();
    });
  });

  it('should show the table title', async () => {
    const { getByText } = await setup();

    const tableTitleText = getByText('Leavers in the last 12 months');

    expect(tableTitleText).toBeTruthy();
  });

  it('should show a "Save and return" button and Cancel link', async () => {
    const { getByRole, getByText } = await setup();

    expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  describe('job roles cta button', () => {
    it('should show the "Add more job roles" if there are already jobs selected', async () => {
      const { getByRole } = await setup({ workplace: mockWorkplaceWithLeavers });
      const addButton = getByRole('button', { name: 'Add more job roles' });

      expect(addButton).toBeTruthy();
    });

    it('should show the "Add job roles" if there are no jobs selected', async () => {
      const { getByRole } = await setup({ leaversFromSelectJobRolePages: null, workplace: mockWorkplace });
      const addButton = getByRole('button', { name: 'Add job roles' });

      expect(addButton).toBeTruthy();
    });

    it('should navigate to update-leavers-job-roles when "Add job roles" is clicked', async () => {
      const { getByRole, routerSpy, component } = await setup({
        leaversFromSelectJobRolePages: null,
        workplace: mockWorkplace,
      });
      const addButton = getByRole('button', { name: 'Add job roles' });

      fireEvent.click(addButton);

      // @ts-expect-error: TS2341: Property 'route' is private
      expect(routerSpy).toHaveBeenCalledWith([`../update-leavers-job-roles`], { relativeTo: component.route });
    });
  });

  it('should show a radio button for "No", and another for "I do not know"', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText(radioButtonLabels.NONE)).toBeTruthy();
    expect(getByLabelText(radioButtonLabels.DONT_KNOW)).toBeTruthy();
  });

  it('should show the description below the total number', async () => {
    const { getByText, getByTestId } = await setup();

    const totalNumberDescription = getByText('Total number of leavers');

    expect(totalNumberDescription).toBeTruthy();
    expect(getByTestId('total-number').textContent).toEqual('0');
  });

  describe('message when no job roles are selected', () => {
    it('should show the default message', async () => {
      const { getByText } = await setup();

      const message = `You've not added any staff who've left SINCE ${todayOneYearAgo}.`;

      expect(getByText(message)).toBeTruthy();
    });

    it('should show the message when none is selected', async () => {
      const { fixture, getByText, getByLabelText } = await setup();

      const noneLabel = getByLabelText(radioButtonLabels.NONE);
      fireEvent.click(noneLabel);
      fixture.detectChanges();

      const message = `No staff left on or after ${todayOneYearAgo}.`;

      expect(getByText(message)).toBeTruthy();
    });

    it("should show the message when don't know is selected", async () => {
      const { fixture, getByText, getByLabelText } = await setup();

      const donNotKnowLabel = getByLabelText(radioButtonLabels.DONT_KNOW);
      fireEvent.click(donNotKnowLabel);
      fixture.detectChanges();

      const message = `You do not know if any staff left on or after ${todayOneYearAgo}.`;

      expect(getByText(message)).toBeTruthy();
    });
  });

  describe('prefill data', () => {
    describe('from database', () => {
      it('should populate the previously saved answer with job roles', async () => {
        const { getByLabelText, getByTestId } = await setup({ workplace: mockWorkplaceWithLeavers });

        mockLeavers.forEach((leaver) => {
          const mockLeaver = getByLabelText(leaver.title) as HTMLInputElement;
          expect(mockLeaver).toBeTruthy();
          expect(getByTestId(`remove-button-${leaver.title}`)).toBeTruthy();
          expect(mockLeaver.value).toEqual(`${leaver.total}`);
        });
        expect(getByTestId('total-number').textContent).toEqual(`${totalJobRoles(mockLeavers)}`);
      });

      it('should populate the previously saved answer of no', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { leavers: jobOptionsEnum.NONE },
        });
        const { component, getByTestId } = await setup({ workplace: mockWorkplace });

        expect(component.form.value.noOrDoNotKnow).toEqual(jobOptionsEnum.NONE);
        expect(getByTestId('total-number').textContent).toEqual('0');
      });

      it('should populate the previously saved answer of do not know', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { leavers: jobOptionsEnum.DONT_KNOW },
        });
        const { component, getByTestId } = await setup({ workplace: mockWorkplace });

        expect(component.form.value.noOrDoNotKnow).toEqual(jobOptionsEnum.DONT_KNOW);
        expect(getByTestId('total-number').textContent).toEqual('0');
      });
    });

    it('should populate the selected job roles from the select job role page', async () => {
      const { getByLabelText, getByTestId } = await setup({ leaversFromSelectJobRolePages: selectedJobRoles });

      const leaver1 = getByLabelText(selectedJobRoles[0].title) as HTMLInputElement;
      expect(leaver1).toBeTruthy();
      expect(getByTestId(`remove-button-${selectedJobRoles[0].title}`)).toBeTruthy();
      expect(leaver1.value).toEqual(`${selectedJobRoles[0].total}`);

      expect(getByTestId('total-number').textContent).toEqual(`${selectedJobRoles[0].total}`);
    });
  });

  describe('saving', () => {
    const mockWorkplace = establishmentBuilder({
      overrides: { leavers: null },
    }) as Establishment;

    it('should call updateJobs to save selected job roles', async () => {
      const { getByRole, fixture, vacanciesAndTurnoverService, updateJobsSpy } = await setup({
        workplace: mockWorkplace,
        leaversFromSelectJobRolePages: selectedJobRoles,
        snapshot: { staffUpdatesView: true },
      });

      const saveButton = getByRole('button', { name: 'Save and return' });
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(vacanciesAndTurnoverService.selectedLeavers).toEqual(null);
      expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, {
        leavers: [{ jobId: selectedJobRoles[0].jobId, total: selectedJobRoles[0].total }],
      });
    });

    Object.keys(radioButtonLabels).forEach((label) => {
      it(`should call updateJobs to save when ${radioButtonLabels[label]} is selected`, async () => {
        const { getByRole, component, fixture, routerSpy, vacanciesAndTurnoverService, updateJobsSpy, getByLabelText } =
          await setup({
            workplace: mockWorkplace,
            leaversFromSelectJobRolePages: selectedJobRoles,
            snapshot: { staffUpdatesView: true },
          });

        const radio = getByLabelText(radioButtonLabels[label]);

        fireEvent.click(radio);
        const saveButton = getByRole('button', { name: 'Save and return' });
        fireEvent.click(saveButton);
        fixture.detectChanges();

        // @ts-expect-error: TS2341: Property 'route' is private
        expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
        expect(vacanciesAndTurnoverService.selectedLeavers).toEqual(null);
        expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, {
          leavers: jobOptionsEnum[label],
        });
      });
    });

    it('should add leavers page to submittedPages in vacanciesAndTurnoverService', async () => {
      const { getByRole, addToSubmittedPagesSpy } = await setup({
        workplace: mockWorkplace,
        leaversFromSelectJobRolePages: selectedJobRoles,
      });

      userEvent.click(getByRole('button', { name: 'Save and return' }));
      expect(addToSubmittedPagesSpy).toHaveBeenCalledWith(WorkplaceUpdatePage.UPDATE_LEAVERS);
    });
  });

  describe('Navigation on save', () => {
    it('should navigate to the update-workplace-details page if staffUpdatesView passed in as true from routing', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { leavers: mockLeavers },
      });
      const { component, routerSpy, getByRole } = await setup({
        workplace: mockWorkplace,
        snapshot: { staffUpdatesView: true },
      });

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      // @ts-expect-error: TS2341: Property 'route' is private
      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it('should navigate to the workplace tab on dashboard when set as returnTo in establishment service', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { leavers: mockLeavers },
      });
      const { routerSpy, getByRole } = await setup({
        workplace: mockWorkplace,
        establishmentService: {
          returnTo: { url: ['/dashboard'], fragment: 'workplace' },
        },
      });

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
    });

    it('should navigate to the funding workplace tab when set as returnTo in establishment service', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { leavers: mockLeavers },
      });
      const { routerSpy, getByRole } = await setup({
        workplace: mockWorkplace,
        establishmentService: { returnTo: { url: ['/funding/data'], fragment: 'workplace' } },
      });

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      expect(routerSpy).toHaveBeenCalledWith(['/funding/data'], { fragment: 'workplace' });
    });

    it('should navigate to the workplace tab on dashboard when no returnTo and not in staffUpdatesView', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { leavers: mockLeavers },
      });
      const { routerSpy, getByRole } = await setup({
        workplace: mockWorkplace,
      });

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
    });
  });

  describe('Navigation on cancel', () => {
    it('should navigate to the update-workplace-details page if staffUpdates view passed in as true from routing', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { leavers: mockLeavers },
      });
      const { component, routerSpy, getByText } = await setup({
        workplace: mockWorkplace,
        snapshot: { staffUpdatesView: true },
      });

      userEvent.click(getByText('Cancel'));

      // @ts-expect-error: TS2341: Property 'route' is private
      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it('should navigate to the workplace tab on dashboard when set as returnTo in establishment service', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { leavers: mockLeavers },
      });
      const { routerSpy, getByText } = await setup({
        workplace: mockWorkplace,
        establishmentService: {
          returnTo: { url: ['/dashboard'], fragment: 'workplace' },
        },
      });

      userEvent.click(getByText('Cancel'));

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
    });

    it('should navigate to the funding workplace tab when set as returnTo in establishment service', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { leavers: mockLeavers },
      });
      const { routerSpy, getByText } = await setup({
        workplace: mockWorkplace,
        establishmentService: { returnTo: { url: ['/funding/data'], fragment: 'workplace' } },
      });

      userEvent.click(getByText('Cancel'));

      expect(routerSpy).toHaveBeenCalledWith(['/funding/data'], { fragment: 'workplace' });
    });

    it('should navigate to the workplace tab on dashboard when no returnTo and not in staffUpdatesView', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { leavers: mockLeavers },
      });
      const { routerSpy, getByText } = await setup({
        workplace: mockWorkplace,
      });

      userEvent.click(getByText('Cancel'));

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
    });
  });

  describe('validation', () => {
    it('should show errors when no job role or radio buttons are selected and Save and return is clicked', async () => {
      const { fixture, getByRole, getAllByText } = await setup();
      const saveAndReturnButton = getByRole('button', { name: 'Save and return' });

      fireEvent.click(saveAndReturnButton);
      fixture.detectChanges();

      const errorMessage1 = getAllByText('Add a job role');
      const errorMessage2 = getAllByText('Select no staff left or do not know');

      expect(errorMessage1.length).toEqual(2);
      expect(errorMessage2.length).toEqual(2);
    });

    it('should show errors when a job role has no value', async () => {
      const jobRole = 'Care worker';
      const { fixture, getByRole, getAllByText, getByLabelText } = await setup({
        leaversFromSelectJobRolePages: [{ jobId: 10, title: jobRole, total: '' }],
      });

      const numberInputForJobRole = getByLabelText(jobRole) as HTMLInputElement;
      userEvent.clear(numberInputForJobRole);

      const saveAndReturnButton = getByRole('button', { name: 'Save and return' });

      fireEvent.click(saveAndReturnButton);
      fixture.detectChanges();

      const errorMessage1Text = 'Enter the number of leavers or remove';

      const errorMessage1 = getAllByText(`${errorMessage1Text} ${jobRole.toLowerCase()}`);
      const errorMessage2 = getAllByText('Select no staff left or do not know');

      expect(errorMessage1.length).toEqual(2);
      expect(errorMessage2.length).toEqual(2);
    });

    it('should show errors when a job role has a value that is not between 1 and 999', async () => {
      const jobRole = 'Care worker';
      const { fixture, getByRole, getByText, getAllByText, getByLabelText } = await setup({
        leaversFromSelectJobRolePages: [{ jobId: 10, title: jobRole, total: '' }],
      });

      const numberInputForJobRole = getByLabelText(jobRole) as HTMLInputElement;
      userEvent.type(numberInputForJobRole, '0');

      const saveAndReturnButton = getByRole('button', { name: 'Save and return' });

      fireEvent.click(saveAndReturnButton);
      fixture.detectChanges();

      const errorMessage1Text = 'Number of leavers must be between 1 and 999';
      const errorMessage1 = getByText(errorMessage1Text);
      const errorMessage1WithJobRole = getByText(`${errorMessage1Text} (${jobRole.toLowerCase()})`);
      const errorMessage2 = getAllByText('Select no staff left or do not know');

      expect(errorMessage1).toBeTruthy();
      expect(errorMessage1WithJobRole).toBeTruthy();
      expect(errorMessage2.length).toEqual(2);
    });

    it('should show the error message without converting abbreviation in job titles to lower case', async () => {
      const { fixture, getByRole, updateJobsSpy, getByLabelText, getByText } = await setup({
        leaversFromSelectJobRolePages: [{ jobId: 36, title: 'IT manager', total: 1 }],
      });

      const numberInputForJobRole = getByLabelText('IT manager') as HTMLInputElement;
      userEvent.clear(numberInputForJobRole);
      userEvent.type(numberInputForJobRole, '0');

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      fixture.detectChanges();

      const expectedErrorMessage = {
        summaryBox: 'Number of leavers must be between 1 and 999 (IT manager)',
        inline: 'Number of leavers must be between 1 and 999',
      };

      fixture.detectChanges();

      expect(getByText(expectedErrorMessage.summaryBox)).toBeTruthy();
      expect(getByText(expectedErrorMessage.inline)).toBeTruthy();

      expect(updateJobsSpy).not.toHaveBeenCalled();
    });
  });

  describe('job roles table', () => {
    Object.keys(radioButtonLabels).forEach((label) => {
      it(`should remove all job roles when ${label} is clicked`, async () => {
        const { getByLabelText, queryByLabelText } = await setup({
          leaversFromSelectJobRolePages: selectedJobRoles,
        });

        const leaver = selectedJobRoles[0].title;
        expect(getByLabelText(leaver)).toBeTruthy();
        const radio = getByLabelText(radioButtonLabels[label]);
        fireEvent.click(radio);

        expect(queryByLabelText(selectedJobRoles[0].title)).toBeFalsy();
      });
    });

    it('should remove the selected job when "Remove" is clicked', async () => {
      const { getByLabelText, getByTestId, fixture, queryByLabelText } = await setup({
        workplace: mockWorkplaceWithLeavers,
      });

      const removeButton = getByTestId(`remove-button-${mockLeavers[0].title}`);
      const leaver = mockLeavers[0].title;
      expect(getByLabelText(leaver)).toBeTruthy();

      fireEvent.click(removeButton);
      fixture.detectChanges();

      expect(queryByLabelText(mockLeavers[0].title)).toBeFalsy();
    });

    it('should increase the selected job number when "+" is clicked', async () => {
      const { getByLabelText, getByTestId, fixture } = await setup({
        workplace: mockWorkplaceWithLeavers,
      });

      const plusButton = getByTestId('plus-button-job-0');

      const jobRole = getByLabelText(mockLeavers[0].title) as HTMLInputElement;

      expect(jobRole.value).toBe(`${mockLeavers[0].total}`);

      fireEvent.click(plusButton);
      fixture.detectChanges();

      expect(jobRole.value).toBe(`${mockLeavers[0].total + 1}`);
      expect(getByTestId('total-number').textContent).toEqual(`${totalJobRoles(mockLeavers) + 1}`);
    });

    it('should decrease the selected job number when "-" is clicked', async () => {
      const { getByLabelText, getByTestId, fixture } = await setup({
        workplace: mockWorkplaceWithLeavers,
      });

      const minusButton = getByTestId('minus-button-job-0');

      const jobRole = getByLabelText(mockLeavers[0].title) as HTMLInputElement;

      expect(jobRole.value).toBe(`${mockLeavers[0].total}`);

      fireEvent.click(minusButton);
      fixture.detectChanges();

      expect(jobRole.value).toBe(`${mockLeavers[0].total - 1}`);
      expect(getByTestId('total-number').textContent).toEqual(`${totalJobRoles(mockLeavers) - 1}`);
    });
  });

  it('should return a server error message', async () => {
    const { fixture, getByRole, updateJobsSpy, getByLabelText, getByText } = await setup({
      workplace: mockWorkplaceWithLeavers,
    });

    const errorResponse = new HttpErrorResponse({
      error: { message: 'Internal server error' },
      status: 500,
      statusText: 'Internal server error',
    });

    updateJobsSpy.and.returnValue(throwError(errorResponse));

    const numberInputForJobRole = getByLabelText('Care worker') as HTMLInputElement;
    userEvent.type(numberInputForJobRole, '4');

    const saveAndReturnButton = getByRole('button', { name: 'Save and return' });

    fireEvent.click(saveAndReturnButton);
    fixture.detectChanges();

    const errorBoxTitle = getByText('There is a problem');
    const errorMessage = getByText('Failed to update leavers');
    expect(errorBoxTitle).toBeTruthy();

    expect(errorMessage).toBeTruthy();
  });
});
