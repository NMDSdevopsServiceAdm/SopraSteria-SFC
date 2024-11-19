import { fireEvent, render, within } from '@testing-library/angular';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { jobOptionsEnum } from '@core/model/establishment.model';
import { getTestBed } from '@angular/core/testing';
import { WindowRef } from '@core/services/window.ref';
import { DoYouHaveVacanciesComponent } from './do-you-have-vacancies.component';

describe('DoYouHaveVacanciesComponent', () => {
  async function setup(overrides: any = {}) {
    const {
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByText,
      queryAllByText,
      queryByTestId,
      getByRole,
    } = await render(DoYouHaveVacanciesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        WindowRef,
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, overrides?.returnUrl, {
            vacancies: overrides?.vacancies,
          }),
          deps: [HttpClient],
        },
      ],
    });
    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateJobs').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByText,
      queryAllByText,
      queryByTestId,
      getByRole,
      establishmentService,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('should render a VacanciesCurrentComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading and caption', async () => {
    const { getByRole, getByTestId } = await setup();

    const heading = getByRole('heading', {
      name: /do you have any current staff vacancies/i,
    });

    const sectionHeading = within(getByTestId('section-heading'));

    expect(heading).toBeTruthy();
    expect(sectionHeading.getByText('Vacancies and turnover')).toBeTruthy();
  });

  it('should show the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.',
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

  it('should return to service users page when you click on the back link', async () => {
    const overrides = { returnUrl: false };

    const { component } = await setup(overrides);

    expect(component.previousRoute).toEqual(['/workplace', `${component.establishment.uid}`, 'service-users']);
  });

  describe('prefill form', () => {
    it('should not prefill the form', async () => {
      const overrides = {
        vacancies: null,
      };

      const { component } = await setup(overrides);

      const form = component.form;

      expect(form.value).toEqual({ vacanciesKnown: null });
    });

    const vacancyAnswers: any = [
      {
        vacancyAnswer: [{ jobRole: 1, total: 1 }],
        value: jobOptionsEnum.YES,
      },
      {
        vacancyAnswer: jobOptionsEnum.NONE,
        value: jobOptionsEnum.NONE,
      },
      {
        vacancyAnswer: jobOptionsEnum.DONT_KNOW,
        value: jobOptionsEnum.DONT_KNOW,
      },
    ];

    vacancyAnswers.forEach((test: any) => {
      it(`should preselect ${test.value} if there was a saved value`, async () => {
        const overrides = {
          vacancies: test.vacancyAnswer,
        };
        const { component } = await setup(overrides);

        const form = component.form;
        expect(form.value).toEqual({ vacanciesKnown: test.value });
      });
    });

    it("should preselect 'Yes' if hasVacancies is true in local storage", async () => {
      const overrides = { returnUrl: false };

      const { component } = await setup(overrides);

      localStorage.setItem('hasVacancies', 'true');

      component.init();

      const form = component.form;

      expect(form.value).toEqual({ vacanciesKnown: 'With Jobs' });
    });

    it("should preselect 'Yes' if hasVacancies is true return to page if the database has a different value", async () => {
      const overrides = { returnUrl: false, vacancies: jobOptionsEnum.NONE };

      const { component } = await setup(overrides);

      localStorage.setItem('hasVacancies', 'true');

      component.init();

      const form = component.form;

      expect(form.value).toEqual({ vacanciesKnown: 'With Jobs' });
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

        component.form.get('vacanciesKnown').setValue('With Jobs');

        const button = getByText('Save and continue');
        const localStorageSpy = spyOn(localStorage, 'setItem');

        fireEvent.click(button);
        fixture.detectChanges();

        expect(localStorageSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSpy.calls.all()[0].args).toEqual(['hasVacancies', 'true']);
        expect(establishmentServiceSpy).not.toHaveBeenCalled();
      });

      it("should clear local storage when 'No' is selected and is submitted", async () => {
        const overrides = { returnUrl: false };

        const { component, fixture, getByText } = await setup(overrides);

        localStorage.setItem('hasVacancies', 'true');

        component.form.get('vacanciesKnown').setValue(jobOptionsEnum.NONE);
        const localStorageSpy = spyOn(localStorage, 'setItem');

        const button = getByText('Save and continue');

        fireEvent.click(button);
        fixture.detectChanges();

        expect(localStorageSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSpy.calls.all()[0].args).toEqual(['hasVacancies', 'false']);
      });

      it("should clear local storage when 'I do not know' is selected and is submitted", async () => {
        const overrides = { returnUrl: false };

        const { component, fixture, getByText } = await setup(overrides);

        localStorage.setItem('hasVacancies', 'true');

        component.form.get('vacanciesKnown').setValue(jobOptionsEnum.DONT_KNOW);
        const localStorageSpy = spyOn(localStorage, 'setItem');

        const button = getByText('Save and continue');

        fireEvent.click(button);
        fixture.detectChanges();

        expect(localStorageSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSpy.calls.all()[0].args).toEqual(['hasVacancies', 'false']);
      });
    });

    it('should call updatedJobs when submitting form with radio button value', async () => {
      const overrides = { returnUrl: false };

      const { component, fixture, getByText, establishmentServiceSpy } = await setup(overrides);

      component.form.get('vacanciesKnown').setValue('None');

      const button = getByText('Save and continue');

      fireEvent.click(button);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalledWith('mocked-uid', {
        vacancies: 'None',
      });
    });

    describe('workplace flow', () => {
      it("should navigate to the select vacancy job roles page when submitting 'Yes'", async () => {
        const overrides = { returnUrl: false };

        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('vacanciesKnown').setValue('With Jobs');
        fixture.detectChanges();

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'select-vacancy-job-roles']);
      });

      it("should navigate to the starters page when submitting 'None'", async () => {
        const overrides = { returnUrl: false };

        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('vacanciesKnown').setValue('None');

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'starters']);
      });

      it("should navigate to the starters page when submitting 'I do not know' ", async () => {
        const overrides = { returnUrl: false };

        const { component, fixture, getByText, routerSpy } = await setup(overrides);

        component.form.get('vacanciesKnown').setValue('I do not know');

        const button = getByText('Save and continue');
        fireEvent.click(button);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'starters']);
      });
    });

    it('should navigate to the starters page when clicking Skip this question link', async () => {
      const overrides = { returnUrl: false };
      const { fixture, getByText, routerSpy } = await setup(overrides);

      const link = getByText('Skip this question');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'starters']);
    });

    it(`should call the setSubmitAction function with an action of skip and save as false when clicking 'Skip this question' link`, async () => {
      const overrides = { returnUrl: false };

      const { component, getByText } = await setup(overrides);

      const setSubmitActionSpy = spyOn(component, 'setSubmitAction').and.callThrough();

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(setSubmitActionSpy).toHaveBeenCalledWith({ action: 'skip', save: false });
    });

    it(`should show 'Continue' cta button and 'Cancel' link if a return url is provided`, async () => {
      const overrides = { returnUrl: true };

      const { getByText } = await setup(overrides);

      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it("should navigate to the select vacancy job roles page when submitting 'Yes'", async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.form.get('vacanciesKnown').setValue('With Jobs');

      const button = getByText('Continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'select-vacancy-job-roles']);
    });

    it("should navigate to the workplace summary page when submitting 'None'", async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.form.get('vacanciesKnown').setValue('None');

      const button = getByText('Continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it("should navigate to the workplace summary page when submitting 'I do not know'", async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.form.get('vacanciesKnown').setValue('I do not know');

      const button = getByText('Continue');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should navigte to the correct page when clicking the cancel link', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.form.get('vacanciesKnown').setValue('None');

      const link = getByText('Cancel');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
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
