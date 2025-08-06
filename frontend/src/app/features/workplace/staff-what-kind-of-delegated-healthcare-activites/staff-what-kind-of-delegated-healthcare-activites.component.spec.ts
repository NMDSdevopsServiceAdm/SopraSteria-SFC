import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import { of } from 'rxjs';
import { StaffWhatKindOfDelegatedHealthcareActivitiesComponent } from './staff-what-kind-of-delegated-healthcare-activites.component';
import { BackService } from '@core/services/back.service';
import userEvent from '@testing-library/user-event';

describe('StaffWhatKindOfDelegatedHealthcareActivitiesComponent', () => {
  async function setup(overrides: any = {}) {
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);
    const setupTools = await render(StaffWhatKindOfDelegatedHealthcareActivitiesComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: BackService,
          useValue: backServiceSpy,
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides.establishmentService ?? {}),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
            },
          },
        },
        Router,
        AlertService,
        WindowRef,
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    const establishmentServiceSpy = spyOn(establishmentService, 'updateEstablishmentFieldWithAudit').and.returnValue(
      of({ ...establishmentService.establishment }),
    );

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');

    return {
      ...setupTools,
      component,
      establishmentServiceSpy,
      alertSpy,
      backServiceSpy,
      routerSpy,
    };
  }

  it('should render StaffWhatKindOfDelegatedHealthcareActivitiesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the page title and caption', async () => {
    const { getByTestId, getByText } = await setup();

    const caption = getByTestId('section-heading');
    const heading = getByText('What kind of delegated healthcare activities do your non-nursing staff carry out?');

    expect(within(caption).getByText('Services')).toBeTruthy();
    expect(heading).toBeTruthy();
  });

  describe('workplace workflow', async () => {
    const overrides = { establishmentService: { returnTo: null } };

    it('should show a progress bar', async () => {
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should show a "Save and continue" cta button and "Skip this question" link', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should set the previous page to service users question page', async () => {
      const { component } = await setup(overrides);

      expect(component.previousRoute).toEqual(['/workplace', 'mocked-uid', 'staff-do-delegated-healthcare-activities']);
    });

    it('should set the back link to the service users question', async () => {
      const { backServiceSpy } = await setup(overrides);

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/workplace', 'mocked-uid', 'staff-do-delegated-healthcare-activities'],
      });
    });

    it('should navigate to staff-recruitment-capture-training-requirement page when user skips the question', async () => {
      const { getByText, routerSpy } = await setup(overrides);

      userEvent.click(getByText('Skip this question'));

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-recruitment-capture-training-requirement',
      ]);
    });

    it('should navigate to staff-recruitment-capture-training-requirement page after submit', async () => {
      const { getByText, routerSpy, establishmentServiceSpy } = await setup(overrides);

      userEvent.click(getByText('Save and continue'));

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-recruitment-capture-training-requirement',
      ]);
      expect(establishmentServiceSpy).not.toHaveBeenCalled();
    });

    it('should render the progress bar', async () => {
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });
  });
});
