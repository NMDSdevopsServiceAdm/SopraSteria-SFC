import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import {
  MockDelegatedHealthcareActivitiesService,
  mockDHADefinition,
  mockDHAs,
} from '@core/test-utils/MockDelegatedHealthcareActivitiesService';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { StaffDoDelegatedHealthcareActivitiesComponent } from './staff-do-delegated-healthcare-activities.component';

describe('StaffDoDelegatedHealthcareActivitiesComponent', () => {
  const labels = ['Yes', 'No', 'I do not know'];
  const values = ['Yes', 'No', "Don't know"];

  const mockDelegatedHealthcareActivities = mockDHAs;

  async function setup(overrides: any = {}) {
    const routerSpy = jasmine.createSpy().and.resolveTo(true);
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);
    const workerHasDHAAnswered = overrides.someWorkersHasDHAAnswered ?? true;

    const setupTools = await render(StaffDoDelegatedHealthcareActivitiesComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory(overrides.establishmentService ?? {}),
        },
        {
          provide: BackService,
          useValue: backServiceSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                delegatedHealthcareActivities: mockDelegatedHealthcareActivities,
                workerHasDHAAnswered,
              },
            },
          },
        },
        {
          provide: Router,
          useFactory: MockRouter.factory({
            navigate: routerSpy,
          }),
        },
        {
          provide: DelegatedHealthcareActivitiesService,
          useClass: MockDelegatedHealthcareActivitiesService,
        },
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

    return {
      ...setupTools,
      component,
      routerSpy,
      establishmentServiceSpy,
      backServiceSpy,
      alertSpy,
    };
  }

  it('should render StaffDoDelegatedHealthcareActivitiesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the section and the heading', async () => {
    const { getByTestId, getByText } = await setup();

    const sectionCaption = 'Services';
    const heading = 'Do your non-nursing staff carry out delegated healthcare activities?';

    expect(within(getByTestId('section-heading')).getByText(sectionCaption)).toBeTruthy();
    expect(getByText(heading)).toBeTruthy();
  });

  it('should show the DHA definition', async () => {
    const { getByText } = await setup();

    expect(getByText(mockDHADefinition)).toBeTruthy();
  });

  it('should display the reveal with DHAs in route data', async () => {
    const { getByText } = await setup();

    const reveal = getByText('See delegated healthcare activities that your staff might carry out');

    expect(reveal).toBeTruthy();
    mockDelegatedHealthcareActivities.forEach((activity) => {
      expect(getByText(activity.title)).toBeTruthy();
      expect(getByText(activity.description)).toBeTruthy();
    });
  });

  describe('Form', () => {
    it('should show radio buttons for each answer', async () => {
      const { getByRole } = await setup();

      labels.forEach((label) => {
        expect(getByRole('radio', { name: label })).toBeTruthy();
      });
    });

    it('should prefill when there is a previously saved answer', async () => {
      const { getByLabelText } = await setup({
        establishmentService: {
          establishment: {
            staffDoDelegatedHealthcareActivities: 'Yes',
          },
        },
      });

      const radioButton = getByLabelText('Yes') as HTMLInputElement;

      expect(radioButton.checked).toBeTruthy();
    });

    for (let i = 0; i < labels.length; i++) {
      it(`should call updateEstablishmentFieldWithAudit with expected payload on submit (${values[i]})`, async () => {
        const { getByLabelText, getByText, establishmentServiceSpy } = await setup({
          establishmentService: { returnTo: null },
        });

        userEvent.click(getByLabelText(labels[i]));

        userEvent.click(getByText('Save and continue'));

        const expectedPayload = {
          staffDoDelegatedHealthcareActivities: values[i],
        };

        expect(establishmentServiceSpy).toHaveBeenCalledWith(
          'mocked-uid',
          'StaffDoDelegatedHealthcareActivities',
          expectedPayload,
        );
      });
    }
  });

  describe('Displaying banner', () => {
    it('should display banner when user submits and return is to home page', async () => {
      const { fixture, getByText, getByLabelText, alertSpy } = await setup({
        establishmentService: {
          returnTo: { url: ['/dashboard'], fragment: 'home' },
        },
      });

      const radioButton = getByLabelText(labels[0]);
      fireEvent.click(radioButton);

      const saveButton = getByText('Save');
      fireEvent.click(saveButton);
      await fixture.whenStable();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Delegated healthcare activity information saved',
      });
    });

    it('should not display banner when user submits but return is not to home page', async () => {
      const { fixture, getByText, getByLabelText, alertSpy } = await setup({
        establishmentService: {
          returnTo: {
            url: ['/dashboard'],
            fragment: 'workplace',
          },
        },
      });

      const radioButton = getByLabelText(labels[0]);
      fireEvent.click(radioButton);

      const saveButton = getByText('Save');
      fireEvent.click(saveButton);
      await fixture.whenStable();

      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should not display banner when user submits in workplace flow', async () => {
      const { fixture, getByText, getByLabelText, alertSpy } = await setup({
        establishmentService: { returnTo: null },
      });

      const radioButton = getByLabelText(labels[0]);
      fireEvent.click(radioButton);

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);
      await fixture.whenStable();

      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  describe('When in new workplace workflow', async () => {
    const overrides = { establishmentService: { returnTo: null } };

    it('should show a progress bar', async () => {
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not display warning message about selecting "No"', async () => {
      const { queryByTestId } = await setup(overrides);

      expect(queryByTestId('warning-on-dha-data-removal')).toBeFalsy();
    });

    it('should show a "Save and continue" cta button and "Skip this question" link', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it('should set the previous page to service users question page', async () => {
      const { component } = await setup(overrides);

      expect(component.previousRoute).toEqual(['/workplace', 'mocked-uid', 'service-users']);
    });

    it('should set the back link to the service users question', async () => {
      const { backServiceSpy } = await setup(overrides);

      expect(backServiceSpy.setBackLink).toHaveBeenCalledWith({
        url: ['/workplace', 'mocked-uid', 'service-users'],
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
  });

  describe('from workplace summary', () => {
    const overrides = { establishmentService: { returnTo: { url: ['/dashboard'], fragment: 'workplace' } } };

    it('should navigate to staff-recruitment-capture-training-requirement page when user skips the question', async () => {
      const { getByText, routerSpy } = await setup(overrides);

      userEvent.click(getByText('Cancel'));
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should navigate to what-kind-of-delegated-healthcare-activities after submitting "Yes" as an answer', async () => {
      const { getByText, getByLabelText, routerSpy, establishmentServiceSpy } = await setup(overrides);

      userEvent.click(getByLabelText('Yes'));
      userEvent.click(getByText('Save'));

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'what-kind-of-delegated-healthcare-activities',
      ]);
      expect(establishmentServiceSpy).toHaveBeenCalled();
    });

    ['No', 'I do not know'].forEach((answer) => {
      it(`should navigate to staff-recruitment-capture-training-requirement page after submitting '${answer}' as an answer`, async () => {
        const { getByText, getByLabelText, routerSpy, establishmentServiceSpy } = await setup(overrides);

        userEvent.click(getByLabelText(answer));
        userEvent.click(getByText('Save'));

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
        expect(establishmentServiceSpy).toHaveBeenCalled();
      });
    });
  });

  describe('warning message about selecting "No"', () => {
    ['Yes', "Don't know", null].forEach((previousAnswer) => {
      it(`should display a warning message about selecting "No" will remove workers DHA answers if previous answer is ${previousAnswer}`, async () => {
        const { getByTestId } = await setup({
          establishmentService: {
            establishment: {
              staffDoDelegatedHealthcareActivities: previousAnswer,
            },
            returnTo: {
              url: ['/dashboard'],
              fragment: 'workplace',
            },
          },
        });

        const warningMessage = getByTestId('warning-on-dha-data-removal');
        expect(warningMessage).toBeTruthy();
        expect(warningMessage.textContent).toContain(
          'If you select No, all delegated healthcare activity data will be removed from your staff records.',
        );
      });
    });

    it('should not display the warning message if already answered as "No"', async () => {
      const { queryByTestId } = await setup({
        establishmentService: {
          establishment: {
            staffDoDelegatedHealthcareActivities: 'No',
          },
          returnTo: {
            url: ['/dashboard'],
            fragment: 'workplace',
          },
        },
      });

      expect(queryByTestId('warning-on-dha-data-removal')).toBeFalsy();
    });

    it('should not display the warning message if none of the workers have DHA question answered', async () => {
      const { queryByTestId } = await setup({
        establishmentService: {
          returnTo: {
            url: ['/dashboard'],
            fragment: 'workplace',
          },
        },
        someWorkersHasDHAAnswered: false,
      });

      expect(queryByTestId('warning-on-dha-data-removal')).toBeFalsy();
    });

    it('should not display the warning message if we are in new workplace flow', async () => {
      const { queryByTestId } = await setup({
        establishmentService: {
          returnTo: null,
        },
      });

      expect(queryByTestId('warning-on-dha-data-removal')).toBeFalsy();
    });
  });
});
