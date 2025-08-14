import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';
import { StaffWhatKindOfDelegatedHealthcareActivitiesComponent } from './staff-what-kind-of-delegated-healthcare-activities.component';
import { BackService } from '@core/services/back.service';

describe('StaffWhatKindOfDelegatedHealthcareActivitiesComponent', () => {
  const mockDelegatedHealthcareActivities = [
    {
      description: 'Like monitoring heart rate as part of the treatment of a condition.',
      id: 1,
      seq: 10,
      title: 'Vital signs monitoring',
    },
    {
      description: 'Like administering warfarin.',
      id: 2,
      seq: 20,
      title: 'Specialised medication administration',
    },
  ];

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
              data: {
                delegatedHealthcareActivities: mockDelegatedHealthcareActivities,
              },
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

  it('should show the hint before the checkbox options', async () => {
    const { getByText } = await setup();

    expect(getByText('Select all that apply.')).toBeTruthy();
  });

  it('should show the checkboxes mockDelegatedHealthcareActivities', async () => {
    const { getByLabelText } = await setup();

    mockDelegatedHealthcareActivities.forEach((delegatedHealthcareActivity) => {
      expect(getByLabelText(delegatedHealthcareActivity.title)).toBeTruthy();
    });
  });

  it('should show the "I do not know" checkbox', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText('I do not know')).toBeTruthy();
  });

  it('should prefill the previously saved data', async () => {
    const establishment = {
      isParent: true,
      staffWhatKindDelegatedHealthcareActivities: {
        whatDelegateHealthcareActivities: 'Yes',
        activities: [{ id: mockDelegatedHealthcareActivities[0].id }],
      },
    };
    const { getByLabelText } = await setup({ establishmentService: { establishment } });

    const dhaActivity = getByLabelText(mockDelegatedHealthcareActivities[0].title) as HTMLInputElement;

    expect(dhaActivity.checked).toBeTruthy();
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

      fireEvent.click(getByText('Skip this question'));

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-recruitment-capture-training-requirement',
      ]);
    });

    it('should navigate to staff-recruitment-capture-training-requirement page after submit', async () => {
      const { getByText, routerSpy, establishmentServiceSpy } = await setup(overrides);

      fireEvent.click(getByText(mockDelegatedHealthcareActivities[0].title));
      fireEvent.click(getByText('Save and continue'));

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-recruitment-capture-training-requirement',
      ]);
      expect(establishmentServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkboxes', () => {
    it('should unselect activities if "I do not know" is ticked', async () => {
      const { fixture, getByLabelText } = await setup();

      const doNotKnowText = 'I do not know';

      fireEvent.click(getByLabelText(mockDelegatedHealthcareActivities[0].title));
      fireEvent.click(getByLabelText(doNotKnowText));

      fixture.detectChanges();

      const checkboxOne = getByLabelText(mockDelegatedHealthcareActivities[0].title) as HTMLInputElement;
      const checkboxTwo = getByLabelText(mockDelegatedHealthcareActivities[1].title) as HTMLInputElement;
      const doNotKnow = getByLabelText(doNotKnowText) as HTMLInputElement;
      expect(checkboxOne.checked).toBeFalsy();
      expect(checkboxTwo.checked).toBeFalsy();
      expect(doNotKnow.checked).toBeTruthy();
    });

    it('should unselect "I do not know" if an activity is ticked', async () => {
      const { getByLabelText } = await setup();

      const doNotKnowText = 'I do not know';

      fireEvent.click(getByLabelText(doNotKnowText));
      fireEvent.click(getByLabelText(mockDelegatedHealthcareActivities[0].title));

      const checkboxOne = getByLabelText(mockDelegatedHealthcareActivities[0].title) as HTMLInputElement;
      const checkboxTwo = getByLabelText(mockDelegatedHealthcareActivities[1].title) as HTMLInputElement;
      const doNotKnow = getByLabelText(doNotKnowText) as HTMLInputElement;

      expect(checkboxOne.checked).toBeTruthy();
      expect(checkboxTwo.checked).toBeFalsy();
      expect(doNotKnow.checked).toBeFalsy();
    });
  });
});
