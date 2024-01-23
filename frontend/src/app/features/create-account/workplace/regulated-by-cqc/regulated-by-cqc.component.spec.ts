import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { RegistrationModule } from '../../../registration/registration.module';
import { RegulatedByCqcComponent } from './regulated-by-cqc.component';

describe('RegulatedByCqcComponent', () => {
  async function setup(registrationFlow = true) {
    const component = await render(RegulatedByCqcComponent, {
      imports: [SharedModule, RegistrationModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
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
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to the find workplace page when selecting yes', async () => {
    const { component, spy } = await setup();
    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['/registration', 'find-workplace']);
  });

  it('should navigate to the find-workplace-address page when selecting no', async () => {
    const { component, spy } = await setup();
    const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
    fireEvent.click(noRadioButton);

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['/registration', 'find-workplace-address']);
  });

  it('should display an error message when not selecting anything', async () => {
    const { component } = await setup();

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    const errorMessage = component.getByTestId('errorMessage');
    expect(errorMessage.innerText).toContain(
      'Select yes if the main service you provide is regulated by the Care Quality Commission',
    );
  });

  describe('prefillForm()', () => {
    it('should preselect the "Yes" radio button if isCqcRegulated has been set to true in the service', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.registrationService.isCqcRegulated$ = new BehaviorSubject(true);
      component.fixture.componentInstance.ngOnInit();

      const form = component.fixture.componentInstance.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.regulatedByCQC).toBe('yes');
    });

    it('should preselect the "No" radio button if isCqcRegulated has been set to false in the service', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.registrationService.isCqcRegulated$ = new BehaviorSubject(false);
      component.fixture.componentInstance.ngOnInit();

      const form = component.fixture.componentInstance.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.regulatedByCQC).toBe('no');
    });

    it('should not preselect any radio buttons if isCqcRegulated has not been set in the service', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.registrationService.isCqcRegulated$ = new BehaviorSubject(null);
      component.fixture.componentInstance.ngOnInit();

      const form = component.fixture.componentInstance.form;
      expect(form.invalid).toBeTruthy();
      expect(form.value.regulatedByCQC).not.toBe('yes');
      expect(form.value.regulatedByCQC).not.toBe('no');
    });
  });
});
