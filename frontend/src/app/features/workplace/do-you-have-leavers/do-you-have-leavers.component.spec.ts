import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { jobOptionsEnum, Starter } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { DoYouHaveLeaversComponent } from './do-you-have-leavers.component';
import { FormatUtil } from '@core/utils/format-util';

describe('DoYouHaveLeaversComponent', () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 1);
  const todayOneYearAgo = FormatUtil.formatDateToLocaleDateString(today);
  async function setup(overrides: any = {}) {
    const setupTools = await render(DoYouHaveLeaversComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        WindowRef,
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory(
            { cqc: null, localAuthorities: null },
            overrides?.returnUrl,
            overrides?.workplace,
          ),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {},
              data: {},
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateJobsSpy = spyOn(establishmentService, 'updateJobs').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      ...setupTools,
      updateJobsSpy,
      routerSpy,
    };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('should render a DoYouHaveLeaversComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading and caption', async () => {
    const { getByRole, getByTestId } = await setup();

    const heading = getByRole('heading', {
      name: `Have you had any leavers SINCE ${todayOneYearAgo}?`,
    });

    const sectionHeading = within(getByTestId('section-heading'));

    expect(heading).toBeTruthy();
    expect(sectionHeading.getByText('Vacancies and turnover')).toBeTruthy();
  });

  it('should show the hint text', async () => {
    const { getByTestId } = await setup();

    const hintText = 'We only want to know about leavers who were in permanent and temporary job roles.';

    expect(within(getByTestId('hint-text')).getByText(hintText)).toBeTruthy();
  });

  it('should show the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      'To show DHSC and the government the size of staff retention issues and help them make national and local policy and funding decisions.',
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
  });

  it('should show the radio buttons', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText('Yes')).toBeTruthy();
    expect(getByLabelText('No')).toBeTruthy();
    expect(getByLabelText('I do not know')).toBeTruthy();
  });

  describe('Prefilling form', () => {
    const leaverAnswers: any = [
      { selectedRadio: 'Yes', leaversInDb: [{ jobRole: 1, total: 1 }] },
      { selectedRadio: 'No', leaversInDb: jobOptionsEnum.NONE },
      { selectedRadio: 'I do not know', leaversInDb: jobOptionsEnum.DONT_KNOW },
    ];

    leaverAnswers.forEach((option: any) => {
      it(`should preselect answer (${option.selectedRadio}) if workplace has value saved`, async () => {
        const overrides = {
          workplace: { leavers: option.leaversInDb },
        };
        const { getByLabelText } = await setup(overrides);

        const selectedRadio = getByLabelText(option.selectedRadio) as HTMLInputElement;
        expect(selectedRadio.checked).toBeTruthy();
      });
    });

    it("should preselect 'Yes' if hasLeavers is true in local storage", async () => {
      localStorage.setItem('hasLeavers', 'true');

      const { component } = await setup();

      const form = component.form;

      expect(form.value).toEqual({ startersLeaversVacanciesKnown: 'With Jobs' });
    });

    it("should preselect 'Yes' if hasLeavers is true even if database has a different value (user has gone back to page)", async () => {
      const overrides = { workplace: { leavers: jobOptionsEnum.NONE } };
      localStorage.setItem('hasLeavers', 'true');

      const { component } = await setup(overrides);

      const form = component.form;

      expect(form.value).toEqual({ startersLeaversVacanciesKnown: 'With Jobs' });
    });

    it('should not preselect if no value in database and user has not gone back to this page', async () => {
      const overrides = { workplace: { leavers: null } };

      const { component } = await setup(overrides);

      const form = component.form;

      expect(form.value).toEqual({ startersLeaversVacanciesKnown: null });
    });
  });

  describe('Workplace flow', () => {
    it(`should show 'Save and continue' cta button and 'Skip this question' link if a return url is not provided`, async () => {
      const overrides = { returnUrl: false };

      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it("should navigate to the select leaver job roles page when submitting 'Yes'", async () => {
      const overrides = { returnUrl: false };
      const { component, fixture, getByText, routerSpy } = await setup(overrides);

      component.form.get('startersLeaversVacanciesKnown').setValue('With Jobs');
      fixture.detectChanges();

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'select-leaver-job-roles',
      ]);
    });

    it("should navigate to the staff-recruitment-capture-training-requirement page when submitting 'None'", async () => {
      const overrides = { returnUrl: false };
      const { component, fixture, getByText, routerSpy } = await setup(overrides);

      component.form.get('startersLeaversVacanciesKnown').setValue('None');

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'staff-recruitment-capture-training-requirement',
      ]);
    });

    it("should navigate to the staff-recruitment-capture-training-requirement page when submitting 'I do not know'", async () => {
      const overrides = { returnUrl: false };
      const { component, fixture, getByText, routerSpy } = await setup(overrides);

      component.form.get('startersLeaversVacanciesKnown').setValue('I do not know');

      const button = getByText('Save and continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'staff-recruitment-capture-training-requirement',
      ]);
    });

    it('should navigate to the staff-recruitment-capture-training-requirement page when clicking Skip this question link', async () => {
      const overrides = { returnUrl: false };
      const { getByText, routerSpy } = await setup(overrides);

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'staff-recruitment-capture-training-requirement',
      ]);
    });

    it(`should call the setSubmitAction function with an action of skip and save as false when clicking 'Skip this question' link`, async () => {
      const overrides = { returnUrl: false };
      const { component, getByText } = await setup(overrides);

      const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();
      const link = getByText('Skip this question');

      fireEvent.click(link);

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'skip', save: false });
    });

    describe('Back link', () => {
      it('should set back link to go to how many starters page when workplace has starters', async () => {
        const starters: Starter[] = [
          {
            jobId: 10,
            title: 'Care worker',
            total: null,
          },
        ];

        const overrides = { returnUrl: false, workplace: { starters } };

        const { component } = await setup(overrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          `${component.establishment.uid}`,
          'workplace-data',
          'add-workplace-details',
          'how-many-starters',
        ]);
      });

      it('should set back link to go to do you have starters page when workplace does not have starters', async () => {
        const overrides = { returnUrl: false, workplace: { starters: jobOptionsEnum.NONE } };

        const { component } = await setup(overrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          `${component.establishment.uid}`,
          'workplace-data',
          'add-workplace-details',
          'do-you-have-starters',
        ]);
      });

      it("should set back link to go to do you have starters page when starters response is don't know", async () => {
        const overrides = { returnUrl: false, workplace: { starters: jobOptionsEnum.DONT_KNOW } };

        const { component } = await setup(overrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          `${component.establishment.uid}`,
          'workplace-data',
          'add-workplace-details',
          'do-you-have-starters',
        ]);
      });
    });
  });

  describe('Page accessed from workplace summary page', () => {
    it(`should show 'Continue' cta button and 'Cancel' link if a return url is provided`, async () => {
      const overrides = { returnUrl: true };

      const { getByText } = await setup(overrides);

      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it("should navigate to the select leaver job roles page when submitting 'Yes'", async () => {
      const overrides = { returnUrl: true };

      const { component, fixture, getByText, routerSpy } = await setup(overrides);

      component.form.get('startersLeaversVacanciesKnown').setValue('With Jobs');

      const button = getByText('Continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'select-leaver-job-roles']);
    });

    it("should navigate to the workplace summary page when submitting 'None'", async () => {
      const overrides = { returnUrl: true };

      const { component, fixture, getByText, routerSpy } = await setup(overrides);

      component.form.get('startersLeaversVacanciesKnown').setValue('None');

      const button = getByText('Continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it("should navigate to the workplace tab on the dashboard when submitting 'I do not know'", async () => {
      const overrides = { returnUrl: true };

      const { component, fixture, getByText, routerSpy } = await setup(overrides);

      component.form.get('startersLeaversVacanciesKnown').setValue('I do not know');

      const button = getByText('Continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should navigate to the workplace tab on the dashboard after clicking the cancel link', async () => {
      const overrides = { returnUrl: true };

      const { component, fixture, getByText, routerSpy } = await setup(overrides);

      component.form.get('startersLeaversVacanciesKnown').setValue('None');

      const link = getByText('Cancel');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });
  });

  describe('local storage', () => {
    it("should store answer in local storage if 'Yes' is selected and not call updateJobs", async () => {
      const { component, fixture, getByText, updateJobsSpy } = await setup();

      component.form.get('startersLeaversVacanciesKnown').setValue('With Jobs');

      const button = getByText('Continue');
      const localStorageSpy = spyOn(localStorage, 'setItem');

      fireEvent.click(button);
      fixture.detectChanges();

      expect(localStorageSpy).toHaveBeenCalledTimes(1);
      expect(localStorageSpy.calls.all()[0].args).toEqual(['hasLeavers', 'true']);
      expect(updateJobsSpy).not.toHaveBeenCalled();
    });

    it("should set hasLeavers in local storage to false when 'No' is selected and is submitted", async () => {
      const { component, fixture, getByText } = await setup();

      localStorage.setItem('hasLeavers', 'true');

      component.form.get('startersLeaversVacanciesKnown').setValue(jobOptionsEnum.NONE);
      const localStorageSpy = spyOn(localStorage, 'setItem');

      const button = getByText('Continue');

      fireEvent.click(button);
      fixture.detectChanges();

      expect(localStorageSpy).toHaveBeenCalledTimes(1);
      expect(localStorageSpy.calls.all()[0].args).toEqual(['hasLeavers', 'false']);
    });

    it("should set hasLeavers in local storage to false when 'I do not know' is selected and is submitted", async () => {
      const { component, fixture, getByText } = await setup();

      localStorage.setItem('hasLeavers', 'true');

      component.form.get('startersLeaversVacanciesKnown').setValue(jobOptionsEnum.DONT_KNOW);
      const localStorageSpy = spyOn(localStorage, 'setItem');

      const button = getByText('Continue');

      fireEvent.click(button);
      fixture.detectChanges();

      expect(localStorageSpy).toHaveBeenCalledTimes(1);
      expect(localStorageSpy.calls.all()[0].args).toEqual(['hasLeavers', 'false']);
    });
  });

  it('should call updateJobs when submitting form with radio button value', async () => {
    const { component, fixture, getByText, updateJobsSpy } = await setup();

    component.form.get('startersLeaversVacanciesKnown').setValue('None');

    const button = getByText('Continue');

    fireEvent.click(button);
    fixture.detectChanges();

    expect(updateJobsSpy).toHaveBeenCalledWith('mocked-uid', {
      leavers: 'None',
    });
  });

  describe('Validation', () => {
    it('should display required warning message when user submits without inputting answer', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(getAllByText(`Select yes if you've had leavers since ${todayOneYearAgo}`).length).toBe(2);
    });
  });

  describe('progress-bar', () => {
    it('should render the section, the question but not the progress bar when not in the flow', async () => {
      const overrides = { returnUrl: true };

      const { getByTestId, queryByTestId } = await setup(overrides);

      expect(getByTestId('section-heading')).toBeTruthy();
      expect(queryByTestId('progress-bar')).toBeFalsy();
    });

    it('should render the progress bar when in the flow', async () => {
      const overrides = { returnUrl: false };

      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });
  });
});
