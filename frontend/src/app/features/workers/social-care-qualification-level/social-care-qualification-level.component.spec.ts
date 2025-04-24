import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';
import { mockQualifications, MockQualificationService } from '@core/test-utils/MockQualificationsService';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { SocialCareQualificationLevelComponent } from './social-care-qualification-level.component';

describe('SocialCareQualificationLevelComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(SocialCareQualificationLevelComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: { uid: 'mocked-uid' },
                },
                url: [{ path: overrides.returnUrl ? 'staff-record-summary' : 'mocked-uid' }],
              },
            },
            snapshot: {
              params: {},
            },
          },
        },
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithOverrides.factory({
            returnTo: () => {
              return overrides.returnUrl
                ? {
                    url: ['/dashboard'],
                    fragment: 'workplace',
                  }
                : null;
            },
          }),
        },
        {
          provide: QualificationService,
          useClass: MockQualificationService,
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const component = setupTools.fixture.componentInstance;

    const workerId = component.worker.uid;
    const workplaceId = component.workplace.uid;

    return {
      ...setupTools,
      component,
      routerSpy,
      router,
      workerId,
      workplaceId,
    };
  }

  it('should render the SocialCareQualificationLevelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup({ returnUrl: true });

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup({ returnUrl: true });

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it(`should navigate to other-qualifications page when submitting from flow`, async () => {
      const { routerSpy, getByText, workerId, workplaceId, getByLabelText } = await setup();

      const secondRadioButton = getByLabelText(mockQualifications[1].level);
      fireEvent.click(secondRadioButton);

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      expect(getByText('Save and continue')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'other-qualifications',
      ]);
    });

    it('should navigate to other-qualifications page when skipping the question in the flow', async () => {
      const { routerSpy, getByText, workerId, workplaceId } = await setup();

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'other-qualifications',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { routerSpy, workerId, workplaceId, getByText, getByLabelText } = await setup({ returnUrl: true });

      const secondRadioButton = getByLabelText(mockQualifications[1].level);
      fireEvent.click(secondRadioButton);

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(getByText('Save and return')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { workerId, workplaceId, routerSpy, getByText } = await setup({ returnUrl: true });

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to funding staff-summary-page page when pressing save and return in funding version', async () => {
      const { component, fixture, workerId, routerSpy, getByText, router, getByLabelText } = await setup();
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      const secondRadioButton = getByLabelText(mockQualifications[1].level);
      fireEvent.click(secondRadioButton);

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(getByText('Save and return')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });

    it('should navigate to funding staff-summary-page page when pressing cancel when in funding version of page', async () => {
      const { component, routerSpy, fixture, getByText, router, workerId } = await setup();
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });
  });
});
