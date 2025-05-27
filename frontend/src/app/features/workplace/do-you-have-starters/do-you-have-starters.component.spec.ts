import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { jobOptionsEnum, Vacancy } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { DoYouHaveStartersComponent } from './do-you-have-starters.component';
import { FormatUtil } from '@core/utils/format-util';

describe('DoYouHaveStartersComponent', () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 1);
  const todayOneYearAgo = FormatUtil.formatDateToLocaleDateString(today);

  async function setup(overrides: any = {}) {
    const setupTools = await render(DoYouHaveStartersComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
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
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateJobs').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      ...setupTools,
      establishmentService,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('should render a DoYouHaveStartersComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading and caption', async () => {
    const { getByRole, getByTestId } = await setup();

    const heading = getByRole('heading', {
      name: `Have you had any starters SINCE ${todayOneYearAgo}?`,
    });

    const sectionHeading = within(getByTestId('section-heading'));

    expect(heading).toBeTruthy();
    expect(sectionHeading.getByText('Vacancies and turnover')).toBeTruthy();
  });

  it('should show the hint text', async () => {
    const { getByTestId } = await setup();

    const hintText = "We only want to know about starters who're in permanent and temporary job roles.";

    expect(within(getByTestId('hint-text')).getByText(hintText)).toBeTruthy();
  });

  it('should show the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.",
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

  describe('prefill form', () => {
    const starterAnswers: any = [
      { selectedRadio: 'Yes', startersInDb: [{ jobRole: 1, total: 1 }] },
      { selectedRadio: 'No', startersInDb: jobOptionsEnum.NONE },
      { selectedRadio: 'I do not know', startersInDb: jobOptionsEnum.DONT_KNOW },
    ];

    starterAnswers.forEach((option: any) => {
      it(`should preselect answer (${option.selectedRadio}) if workplace has value saved`, async () => {
        const overrides = {
          workplace: { starters: option.startersInDb },
        };
        const { getByLabelText } = await setup(overrides);

        const selectedRadio = getByLabelText(option.selectedRadio) as HTMLInputElement;
        expect(selectedRadio.checked).toBeTruthy();
      });
    });

    it("should preselect 'Yes' if hasStarters is true in local storage (user has clicked yes and gone back)", async () => {
      const overrides = { returnUrl: false };
      localStorage.setItem('hasStarters', 'true');

      const { component } = await setup(overrides);

      const form = component.form;

      expect(form.value).toEqual({ startersLeaversVacanciesKnown: 'With Jobs' });
    });

    it("should preselect 'Yes' if hasStarters is true and the database has a different value", async () => {
      const overrides = { returnUrl: false, workplace: { starters: jobOptionsEnum.NONE } };
      localStorage.setItem('hasStarters', 'true');

      const { component } = await setup(overrides);

      const form = component.form;

      expect(form.value).toEqual({ startersLeaversVacanciesKnown: 'With Jobs' });
    });

    it('should not preselect if no value in database and user has not gone back to this page', async () => {
      const overrides = { workplace: { starters: null } };

      const { component } = await setup(overrides);

      const form = component.form;

      expect(form.value).toEqual({ startersLeaversVacanciesKnown: null });
    });
  });

  describe('submit buttons and submitting form', () => {
    it(`should show 'Save and continue' cta button and 'Skip this question' link, if a return url is not provided`, async () => {
      const overrides = { returnUrl: false };

      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    describe('local storage', () => {
      it("should store answer in local storage if 'Yes' is selected and not call updatedJobs", async () => {
        const overrides = { returnUrl: false };

        const { component, fixture, getByText, establishmentServiceSpy } = await setup(overrides);

        component.form.get('startersLeaversVacanciesKnown').setValue('With Jobs');

        const button = getByText('Save and continue');
        const localStorageSpy = spyOn(localStorage, 'setItem');

        fireEvent.click(button);
        fixture.detectChanges();

        expect(localStorageSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSpy.calls.all()[0].args).toEqual(['hasStarters', 'true']);
        expect(establishmentServiceSpy).not.toHaveBeenCalled();
      });

      it("should clear local storage when 'No' is selected and is submitted", async () => {
        const overrides = { returnUrl: false };

        const { component, fixture, getByText } = await setup(overrides);

        localStorage.setItem('hasStarters', 'true');

        component.form.get('startersLeaversVacanciesKnown').setValue(jobOptionsEnum.NONE);
        const localStorageSpy = spyOn(localStorage, 'setItem');

        const button = getByText('Save and continue');

        fireEvent.click(button);
        fixture.detectChanges();

        expect(localStorageSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSpy.calls.all()[0].args).toEqual(['hasStarters', 'false']);
      });

      it("should clear local storage when 'I do not know' is selected and is submitted", async () => {
        const overrides = { returnUrl: false };

        const { component, fixture, getByText } = await setup(overrides);

        localStorage.setItem('hasStarters', 'true');

        component.form.get('startersLeaversVacanciesKnown').setValue(jobOptionsEnum.DONT_KNOW);
        const localStorageSpy = spyOn(localStorage, 'setItem');

        const button = getByText('Save and continue');

        fireEvent.click(button);
        fixture.detectChanges();

        expect(localStorageSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSpy.calls.all()[0].args).toEqual(['hasStarters', 'false']);
      });
    });

    it('should call updatedJobs when submitting form with radio button value', async () => {
      const overrides = { returnUrl: false };

      const { component, fixture, getByText, establishmentServiceSpy } = await setup(overrides);

      component.form.get('startersLeaversVacanciesKnown').setValue('None');

      const button = getByText('Save and continue');

      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        starters: 'None',
      });
    });

    describe('workplace flow', () => {
      it("should navigate to the select vacancy job roles page when submitting 'Yes'", async () => {
        const overrides = { returnUrl: false };
        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('startersLeaversVacanciesKnown').setValue('With Jobs');
        fixture.detectChanges();

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'select-starter-job-roles']);
      });

      it("should navigate to the do-you-have-leavers page when submitting 'None'", async () => {
        const overrides = { returnUrl: false };
        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('startersLeaversVacanciesKnown').setValue('None');

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'do-you-have-leavers']);
      });

      it("should navigate to the do-you-have-leavers page when submitting 'I do not know' ", async () => {
        const overrides = { returnUrl: false };
        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('startersLeaversVacanciesKnown').setValue('I do not know');

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'do-you-have-leavers']);
      });

      it('should navigate to the do-you-have-leavers page when clicking Skip this question link', async () => {
        const overrides = { returnUrl: false };
        const { fixture, getByText, routerSpy } = await setup(overrides);

        const link = getByText('Skip this question');
        fireEvent.click(link);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'do-you-have-leavers']);
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
        it('should set back link to go to how many vacancies page when workplace has vacancies', async () => {
          const vacancies: Vacancy[] = [
            {
              jobId: 10,
              title: 'Care worker',
              total: null,
            },
          ];

          const overrides = { returnUrl: false, workplace: { vacancies } };

          const { component } = await setup(overrides);

          expect(component.previousRoute).toEqual([
            '/workplace',
            `${component.establishment.uid}`,
            'how-many-vacancies',
          ]);
        });

        it('should set back link to go to do you have vacancies page when workplace does not have vacancies', async () => {
          const overrides = { returnUrl: false, workplace: { vacancies: jobOptionsEnum.NONE } };

          const { component } = await setup(overrides);

          expect(component.previousRoute).toEqual([
            '/workplace',
            `${component.establishment.uid}`,
            'do-you-have-vacancies',
          ]);
        });

        it("should set back link to go to do you have vacancies page when vacancies response is don't know", async () => {
          const overrides = { returnUrl: false, workplace: { vacancies: jobOptionsEnum.DONT_KNOW } };

          const { component } = await setup(overrides);

          expect(component.previousRoute).toEqual([
            '/workplace',
            `${component.establishment.uid}`,
            'do-you-have-vacancies',
          ]);
        });
      });
    });

    describe('workplace summary page', () => {
      it(`should show 'Continue' cta button and 'Cancel' link if a return url is provided`, async () => {
        const overrides = { returnUrl: true };

        const { getByText } = await setup(overrides);

        expect(getByText('Continue')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it("should navigate to the select vacancy job roles page when submitting 'Yes'", async () => {
        const overrides = { returnUrl: true };

        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('startersLeaversVacanciesKnown').setValue('With Jobs');

        const button = getByText('Continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'select-starter-job-roles']);
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

      it("should navigate to the workplace summary page when submitting 'I do not know'", async () => {
        const overrides = { returnUrl: true };

        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('startersLeaversVacanciesKnown').setValue('I do not know');

        const button = getByText('Continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
      });

      it('should navigte to the correct page when clicking the cancel link', async () => {
        const overrides = { returnUrl: true };

        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('startersLeaversVacanciesKnown').setValue('None');

        const link = getByText('Cancel');
        fireEvent.click(link);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
      });
    });
  });

  describe('Validation', () => {
    it('should display required warning message when user submits without inputting answer', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(getAllByText(`Select yes if you've had starters since ${todayOneYearAgo}`).length).toBe(2);
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
