import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { VacanciesJobRoleSelectionComponent } from './vacancies-job-role-selection.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { HttpClient } from '@angular/common/http';

fdescribe('VacanciesJobRoleSelectionComponent', () => {
  const setup = async (override: any = {}) => {
    const returnUrl = override.returnUrl ?? 'true';
    const vacancies = override.vacancies;

    const { fixture, getByText, getByTestId, getByRole, queryByTestId } = await render(
      VacanciesJobRoleSelectionComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: EstablishmentService,
            useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnUrl, {
              vacancies,
            }),
            deps: [HttpClient],
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateJobs').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { component, fixture, getByText, getByTestId, getByRole, queryByTestId };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display a heading and a section heading', async () => {
      const { getByRole, getByText } = await setup();
      const heading = getByRole('heading', { name: 'Select your current staff vacancy job roles' });
      const sectionHeading = getByText('Vacancies and turnover');

      expect(heading).toBeTruthy();
      expect(sectionHeading).toBeTruthy();
    });

    describe('progress bar', () => {
      it('should not render a progress bar when not in the flow', async () => {
        const { getByTestId, queryByTestId } = await setup();

        expect(getByTestId('section-heading')).toBeTruthy();
        expect(queryByTestId('progress-bar')).toBeFalsy();
      });

      it('should render a progress bar when in the flow', async () => {
        const { component, fixture, getByTestId } = await setup({ returnUrl: false });

        expect(getByTestId('progress-bar')).toBeTruthy();
      });
    });
  });
});
