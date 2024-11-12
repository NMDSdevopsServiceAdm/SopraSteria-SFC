import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { VacanciesJobRoleSelectionComponent } from './vacancies-job-role-selection.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { HttpClient } from '@angular/common/http';

fdescribe('VacanciesJobRoleSelectionComponent', () => {
  const mockAvailableJobs = [
    {
      id: 4,
      jobRoleGroup: 'Professional and related roles',
      title: 'Allied health professional (not occupational therapist)',
    },
    {
      id: 10,
      jobRoleGroup: 'Care providing roles',
      title: 'Care worker',
    },
    {
      id: 23,
      title: 'Registered nurse',
      jobRoleGroup: 'Professional and related roles',
    },
    {
      id: 27,
      title: 'Social worker',
      jobRoleGroup: 'Professional and related roles',
    },
  ];

  const setup = async (override: any = {}) => {
    const returnUrl = override.returnUrl ?? 'true';
    const vacancies = override.vacancies;
    const availableJobs = override.availableJobs ?? mockAvailableJobs;

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
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                params: {},
                data: {
                  jobs: availableJobs,
                },
              },
            },
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
      const heading = getByRole('heading', { name: 'Select job roles for all your current staff vacancies' });
      const sectionHeading = getByText('Vacancies and turnover');

      expect(heading).toBeTruthy();
      expect(sectionHeading).toBeTruthy();
    });

    describe('accordion', () => {
      it('should show the accordion', async () => {
        const { getByTestId } = await setup();

        expect(getByTestId('groupedAccordion')).toBeTruthy();
      });

      it('should show the accordion headings', async () => {
        const { getByText } = await setup();

        expect(getByText('Care providing roles')).toBeTruthy();
        expect(getByText('Professional and related roles')).toBeTruthy();
      });
    });

    describe('progress bar', () => {
      it('should not render a progress bar when not in the flow', async () => {
        const { getByTestId, queryByTestId } = await setup();

        expect(getByTestId('section-heading')).toBeTruthy();
        expect(queryByTestId('progress-bar')).toBeFalsy();
      });

      it('should render a progress bar when in the flow', async () => {
        const { getByTestId } = await setup({ returnUrl: false });

        expect(getByTestId('progress-bar')).toBeTruthy();
      });
    });
  });
});
