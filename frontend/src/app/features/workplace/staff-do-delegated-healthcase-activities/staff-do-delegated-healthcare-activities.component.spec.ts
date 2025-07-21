import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { StaffDoDelegatedHealthcareActivitiesComponent } from './staff-do-delegated-healthcare-activities.component';

describe('StaffDoDelegatedHealthcareActivitiesComponent', () => {
  async function setup(overrides: any = {}) {
    const routerSpy = jasmine.createSpy().and.resolveTo(true);
    const backServiceSpy = jasmine.createSpyObj('BackService', ['setBackLink']);

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
              data: {},
            },
          },
        },
        {
          provide: Router,
          useFactory: MockRouter.factory({
            navigate: routerSpy,
          }),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    const establishmentServiceSpy = spyOn(establishmentService, 'updateEstablishmentFieldWithAudit').and.returnValue(
      of({ ...establishmentService.establishment }),
    );

    return {
      ...setupTools,
      component,
      routerSpy,
      establishmentServiceSpy,
      backServiceSpy,
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

  describe('Form', () => {
    const labels = ['Yes', 'No', 'I do not know'];
    const values = ['Yes', 'No', "Don't know"];

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
          'staffDoDelegatedHealthcareActivities',
          expectedPayload,
        );
      });
    }
  });

  describe('When in new workplace workflow', async () => {
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

    it('should render the progress bar', async () => {
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });
  });
});
