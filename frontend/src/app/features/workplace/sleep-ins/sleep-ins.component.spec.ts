import { fireEvent, render, within } from '@testing-library/angular';
import { SleepInsComponent } from './sleep-ins.component';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { YesNoDontKnowOptions } from '@core/model/YesNoDontKnow.enum';
import { getTestBed } from '@angular/core/testing';
import { WindowRef } from '@core/services/window.ref';
import { patchRouterUrlForWorkplaceQuestions } from '@core/test-utils/patchUrlForWorkplaceQuestions';
import { of } from 'rxjs';

describe('SleepInsComponent', () => {
  const options = YesNoDontKnowOptions;

  async function setup(overrides: any = {}) {
    const isInAddDetailsFlow = !overrides.returnToUrl;

    const setupTools = await render(SleepInsComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        patchRouterUrlForWorkplaceQuestions(isInAddDetailsFlow),
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
        },
        WindowRef,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateSingleEstablishmentField').and.returnValue(
          of({ data: {  } }),
        );
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { ...setupTools, component, establishmentServiceSpy, routerSpy };
  }

  it('should render SleepInsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByText } = await setup();

    const heading = 'Does your workplace offer sleep-ins?';

    expect(getByText(heading)).toBeTruthy();
  });

  describe('caption', () => {
    it('should show "Services" as the caption', async () => {
      const { getByTestId } = await setup();
      const sectionCaption = 'Services';

      expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    });
  });

  describe('form', () => {
    it('should show the radio buttons', async () => {
      const { getByRole } = await setup();

      options.forEach((option) => {
        expect(getByRole('radio', { name: option.label })).toBeTruthy();
      });
    });
  });

  describe('workplace flow', () => {
    const overrides = { returnToUrl: null };

    it('should show a progress bar', async () => {
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should show a "Save and continue" cta button and "Skip this question" link', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    describe('back link', () => {
      it('should set the previous page to service-users question page if canDoDelegatedHealthcareActivities is false', async () => {
        const updatedOverrides = {
          ...overrides,
          establishmentObj: { mainService: { canDoDelegatedHealthcareActivities: false } },
        };

        const { component } = await setup(updatedOverrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'service-users',
        ]);
      });

      it('should set the previous page to what-kind-of-delegated-healthcare-activities question page if canDoDelegatedHealthcareActivities is true', async () => {
        const updatedOverrides = {
          ...overrides,
          establishmentObj: { mainService: { canDoDelegatedHealthcareActivities: true } },
        };

        const { component } = await setup(updatedOverrides);

        expect(component.previousRoute).toEqual([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'what-kind-of-delegated-healthcare-activities',
        ]);
      });
    });

    it('should navigate to do-you-have-vacancies page when user skips the question', async () => {
      const { getByText, routerSpy, fixture } = await setup(overrides);

      fireEvent.click(getByText('Skip this question'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'do-you-have-vacancies',
      ]);
    });

    it('should navigate to do-you-have-vacancies page after submit if user did not answer', async () => {
      const { getByText, fixture, routerSpy, establishmentServiceSpy } = await setup(overrides);

      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'workplace-data',
        'add-workplace-details',
        'do-you-have-vacancies',
      ]);
      expect(establishmentServiceSpy).not.toHaveBeenCalled();
    });

    [options[1], options[2]].forEach((option) => {
      it(`should navigate to do-you-have-vacancies page after submit if user answered ${option.label}`, async () => {
        const { component, getByText, getByLabelText, fixture, routerSpy, establishmentServiceSpy } = await setup(
          overrides,
        );

        fireEvent.click(getByLabelText(option.label));
        fixture.detectChanges();
        fireEvent.click(getByText('Save and continue'));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.establishment.uid,
          'workplace-data',
          'add-workplace-details',
          'do-you-have-vacancies',
        ]);
        expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, {
          property: 'offerSleepIn',
          value: option.value,
        });
      });
    });

    it('should navigate to how-to-pay-for-sleep-in page after submit if user answered "Yes', async () => {
      const { component, getByText, getByLabelText, fixture, routerSpy, establishmentServiceSpy } = await setup(
        overrides,
      );

      fireEvent.click(getByLabelText("Yes"));
      fixture.detectChanges();

      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.establishment.uid,
        'workplace-data',
        'add-workplace-details',
        'how-to-pay-for-sleep-in',
      ]);
      expect(establishmentServiceSpy).toHaveBeenCalledWith(component.establishment.uid, {
        property: 'offerSleepIn',
        value: "Yes",
      });
    });
  });
});
