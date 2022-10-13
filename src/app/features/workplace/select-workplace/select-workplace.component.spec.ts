import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SelectWorkplaceComponent } from './select-workplace.component';

fdescribe('SelectWorkplaceComponent', () => {
  async function setup(registrationFlow = true, manyLocationAddresses = false) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId, queryByTestId } = await render(
      SelectWorkplaceComponent,
      {
        imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule],
        providers: [
          {
            provide: RegistrationService,
            useFactory: MockRegistrationService.factory({ value: 'Private Sector' }, manyLocationAddresses),
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
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const registrationService = injector.inject(RegistrationService) as RegistrationService;

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
      getByTestId,
      queryByTestId,
      registrationService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
