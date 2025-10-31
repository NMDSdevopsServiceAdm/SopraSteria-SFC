import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistrationService } from '@core/services/registration.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { RegistrationModule } from '../../../registration/registration.module';
import { RegulatedByCqcComponent } from './regulated-by-cqc.component';

describe('RegulatedByCqcComponent', () => {
  async function setup(registrationFlow = true) {
    const setupTools = await render(RegulatedByCqcComponent, {
      imports: [SharedModule, RegistrationModule, ReactiveFormsModule],
      providers: [
        {
          provide: RegistrationService,
          useClass: RegistrationService,
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: registrationFlow ? 'registration' : 'confirm-details',
                  },
                ],
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const navigateSpy = spyOn(router, 'navigate');
    navigateSpy.and.returnValue(Promise.resolve(true));

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      navigateSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to the find workplace page when selecting yes', async () => {
    const { getByText, navigateSpy, getByRole } = await setup();
    const yesRadioButton = getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(navigateSpy).toHaveBeenCalledWith(['/registration', 'find-workplace']);
  });

  it('should navigate to the find-workplace-address page when selecting no', async () => {
    const { getByText, getByRole, navigateSpy } = await setup();
    const noRadioButton = getByRole('radio', { name: /^No/ });
    fireEvent.click(noRadioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(navigateSpy).toHaveBeenCalledWith(['/registration', 'find-workplace-address']);
  });

  it('should display an error message when not selecting anything', async () => {
    const { getByText, getByTestId } = await setup();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    const errorMessage = getByTestId('errorMessage');
    expect(errorMessage.innerText).toContain(
      'Select yes if the main service you provide is regulated by the Care Quality Commission',
    );
  });

  describe('prefillForm()', () => {
    it('should preselect the "Yes" radio button if isCqcRegulated has been set to true in the service', async () => {
      const { component } = await setup();

      component.registrationService.isCqcRegulated$ = new BehaviorSubject(true);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.regulatedByCQC).toBe('yes');
    });

    it('should preselect the "No" radio button if isCqcRegulated has been set to false in the service', async () => {
      const { component } = await setup();

      component.registrationService.isCqcRegulated$ = new BehaviorSubject(false);
      component.ngOnInit();

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.regulatedByCQC).toBe('no');
    });

    it('should not preselect any radio buttons if isCqcRegulated has not been set in the service', async () => {
      const { component } = await setup();

      component.registrationService.isCqcRegulated$ = new BehaviorSubject(null);
      component.ngOnInit();

      const form = component.form;
      expect(form.invalid).toBeTruthy();
      expect(form.value.regulatedByCQC).not.toBe('yes');
      expect(form.value.regulatedByCQC).not.toBe('no');
    });
  });
});
