import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { queryByText, render } from '@testing-library/angular';

import { NewSelectMainServiceComponent } from './new-select-main-service.component';

describe('NewSelectMainServiceComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(NewSelectMainServiceComponent, {
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
          useClass: MockRegistrationService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
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
    });

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
    };
  }

  it('should show NewSelectMainServiceComponent component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show CQC text when following the CQC regulated flow', async () => {
    const { component, fixture, getByText } = await setup();

    component.isRegulated = true;
    component.renderForm = true;

    fixture.detectChanges();
    const cqcText = getByText(
      'Because you said the main service you provide is regulated by the Care Quality Commission (CQC), Skills for Care will need to check your selection matches the CQC database.',
    );
    expect(cqcText).toBeTruthy();
  });

  it('should show standard text when following the not CQC regulated flow and feature flag is off', async () => {
    const { component, fixture, getByText } = await setup();

    component.createAccountNewDesign = false;
    component.isRegulated = false;
    component.renderForm = true;

    fixture.detectChanges();
    const cqcText = getByText(
      'We need some details about where you work. You need to answer these questions before we can create your account.',
    );

    expect(cqcText).toBeTruthy();
  });

  it('should show no description text when following the not CQC regulated flow and feature flag is on', async () => {
    const { component, fixture, queryByText } = await setup();

    component.createAccountNewDesign = true;
    component.isRegulated = false;
    component.renderForm = true;

    fixture.detectChanges();
    const cqcText = queryByText(
      'We need some details about where you work. You need to answer these questions before we can create your account.',
    );

    expect(cqcText).toBeNull();
  });

  it('should set the correct back link to the is this your workplace page', async () => {
    const { component, fixture } = await setup();
    const backLinkSpy = spyOn(fixture.componentInstance.backService, 'setBackLink');

    component.setBackLink();
    fixture.detectChanges();

    expect(backLinkSpy).toHaveBeenCalledWith({
      url: ['/registration/your-workplace'],
    });
  });

  it('should set the correct back link to the is this your workplace page', async () => {
    const { component, fixture } = await setup();
    const backLinkSpy = spyOn(fixture.componentInstance.backService, 'setBackLink');

    component.setBackLink();
    fixture.detectChanges();

    expect(backLinkSpy).toHaveBeenCalledWith({
      url: ['/registration/your-workplace'],
    });
  });

  it("should see 'Select its main service' when is a parent", async () => {
    const { component, fixture, queryByText } = await setup();

    component.isParent = true;
    component.isRegulated = false;
    component.renderForm = true;
    fixture.detectChanges();

    expect(queryByText('Select its main service')).toBeTruthy();
  });

  it("should see 'Select your main service' when is not a parent", async () => {
    const { component, fixture, queryByText } = await setup();

    component.isParent = false;
    component.isRegulated = false;
    component.renderForm = true;
    fixture.detectChanges();

    expect(queryByText('Select your main service')).toBeTruthy();
  });
});
