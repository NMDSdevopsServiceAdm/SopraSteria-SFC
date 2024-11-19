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
import { DoYouHaveStartersComponent } from './do-you-have-starters.component';

fdescribe('DoYouHaveStartersComponent', () => {
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
    } = await render(DoYouHaveStartersComponent, {
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

  it('should render a DoYouHaveStartersComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
