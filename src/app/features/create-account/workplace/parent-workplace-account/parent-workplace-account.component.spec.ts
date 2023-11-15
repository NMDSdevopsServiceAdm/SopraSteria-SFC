import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { ParentWorkplaceAccount } from './parent-workplace-account.component';

fdescribe('ParentWorkplaceAccount', () => {
  async function setup(mainServicePrefilled = true, registrationFlow = true) {
    const { fixture, getByText, getAllByText, queryByText, getByLabelText, getByTestId, queryByTestId } = await render(
      ParentWorkplaceAccount,
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
                      path: registrationFlow ? 'registration' : 'confirm-details',
                    },
                  ],
                },
              },
            },
          },
          UntypedFormBuilder,
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
      queryByTestId,
    };
  }

  it('should render SelectMainServiceComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the page title', async () => {
    const { getByText } = await setup();

    const pageTitleText = getByText('Parent workplace accounts');

    expect(pageTitleText).toBeTruthy();
  });

  xit('should show the continue button', async () => {
    const { getByText } = await setup();

    const buttonText = getByText('Continue');

    expect(buttonText).toBeTruthy();
  });

  xit('should submit and go to the registration/add-total-staff url when option selected and is not parent', async () => {
    const { component, fixture, getByText, getByLabelText, spy } = await setup();

    // component.isParent = false;
    // component.isRegulated = true;
    // fixture.detectChanges();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(spy).toHaveBeenCalledWith(['registration', 'add-total-staff']);
  });
});
