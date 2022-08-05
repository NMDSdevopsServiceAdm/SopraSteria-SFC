import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import {
  MockRegistrationService,
  MockRegistrationServiceWithMainService,
} from '@core/test-utils/MockRegistrationService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { SelectMainServiceComponent } from './select-main-service.component';

describe('SelectMainServiceComponent', () => {
  async function setup(mainServicePrefilled = false) {
    const { fixture, getByText, getAllByText, queryByText, getByLabelText, getByTestId } = await render(
      SelectMainServiceComponent,
      {
        imports: [
          SharedModule,
          RegistrationModule,
          RouterTestingModule,
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        providers: [
          {
            provide: RegistrationService,
            useClass: mainServicePrefilled ? MockRegistrationServiceWithMainService : MockRegistrationService,
          },
          {
            provide: WorkplaceService,
            useClass: MockWorkplaceService,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                parent: {
                  url: [
                    {
                      path: 'registration',
                    },
                  ],
                },
              },
            },
          },
          FormBuilder,
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
      getByLabelText,
      getByTestId,
    };
  }

  it('should render SelectMainServiceComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show CQC text when following the CQC regulated flow', async () => {
    const { component, fixture, getByText } = await setup();

    component.isRegulated = true;

    fixture.detectChanges();
    const cqcText = getByText(
      'Because you said the main service you provide is regulated by the Care Quality Commission (CQC), Skills for Care will need to check your selection matches the CQC database.',
    );
    expect(cqcText).toBeTruthy();
  });

  it('should show no description text when following the not CQC regulated flow', async () => {
    const { component, fixture, queryByText } = await setup();

    component.isRegulated = false;

    fixture.detectChanges();
    const cqcText = queryByText(
      'We need some details about where you work. You need to answer these questions before we can create your account.',
    );

    expect(cqcText).toBeNull();
  });

  it(`should see 'Select your main service' when is not a parent`, async () => {
    const { component, fixture, queryByText } = await setup();

    component.isParent = false;
    component.isRegulated = false;
    fixture.detectChanges();

    expect(queryByText('Select your main service')).toBeTruthy();
  });

  it('should show registration error message when nothing has been selected(plus title with same wording)', async () => {
    const { component, fixture, getByText, getAllByText } = await setup();
    component.isRegulated = true;
    const form = component.form;

    fixture.detectChanges();

    const errorMessage = 'Select your main service';

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage).length).toBe(3);
  });

  it('should submit and go to the registration/add-total-staff url when option selected and is not parent', async () => {
    const { component, fixture, getByText, getByLabelText, spy } = await setup();

    component.isParent = false;
    component.isRegulated = true;
    fixture.detectChanges();

    const radioButton = getByLabelText('Name');
    fireEvent.click(radioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'add-total-staff']);
  });

  it('should submit and go to the registration/confirm-details url when option selected and returnToConfirmDetails is not null', async () => {
    const { component, fixture, getByText, getByLabelText, spy } = await setup();

    component.isParent = false;
    component.isRegulated = true;
    component.returnToConfirmDetails = { url: ['registration', 'confirm-details'] };
    fixture.detectChanges();

    const radioButton = getByLabelText('Name');
    fireEvent.click(radioButton);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'confirm-details']);
  });

  it('should show the other input box when an other option is selected', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.isParent = false;
    component.isRegulated = true;
    fixture.detectChanges();
    const otherDrop = getByTestId('workplaceServiceOther-123');

    expect(otherDrop.getAttribute('class')).toContain('govuk-radios__conditional--hidden');

    const otherOption = getByTestId('workplaceService-123');
    fireEvent.click(otherOption);

    expect(otherDrop.getAttribute('class')).not.toContain('govuk-radios__conditional--hidden');
  });

  it('should prefill the other input box with the correct value', async () => {
    const { component, fixture } = await setup(true);

    component.isParent = false;
    component.isRegulated = true;

    fixture.detectChanges();
    const form = component.form;

    expect(form.get('otherWorkplaceService123').value).toEqual('Hello!');
  });

  describe('setBackLink()', () => {
    it('should set back link to type-of-employer', async () => {
      const { component, fixture } = await setup();

      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'type-of-employer'],
      });
    });
  });
});
