import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import {
  MockWorkerService,
  MockWorkerServiceWithoutReturnUrl,
  MockWorkerServiceWithUpdateWorker,
} from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, getByLabelText, render } from '@testing-library/angular';

import { SocialCareQualificationComponent } from './social-care-qualification.component';

fdescribe('SocialCareQualificationComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      SocialCareQualificationComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                parent: {
                  url: [{ path: returnUrl ? 'staff-record-summary' : 'mocked-uid' }],
                },
              },
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: '' }],
                },
              },
            },
          },
          {
            provide: WorkerService,
            useClass: returnUrl ? MockWorkerServiceWithUpdateWorker : MockWorkerServiceWithoutReturnUrl,
          },
        ],
      },
    );

    const injector = getTestBed();

    const component = fixture.componentInstance;
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      routerSpy,
    };
  }

  it('should render the SocialCareQualificationComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup(false);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  fdescribe('navigation', () => {
    it(`should navigate to social-care-qualification-level page when submitting from flow and 'Yes' is selected`, async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButtonYes = getByLabelText('Yes');
      fireEvent.click(radioButtonYes);

      fixture.detectChanges();

      console.log(component.form.value);

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      expect(getByText('Save and continue')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'social-care-qualification-level',
      ]);
    });

    it(`should navigate to other-qualifications page when submitting from flow and 'No' is selected`, async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButtonYes = getByLabelText('No');
      fireEvent.click(radioButtonYes);

      fixture.detectChanges();

      console.log(component.form.value);

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

    it(`should navigate to other-qualifications page when submitting from flow and 'I do not know' is selected`, async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButtonUnknown = getByLabelText('I do not know');
      fireEvent.click(radioButtonUnknown);

      fixture.detectChanges();

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
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

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
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButtonNo = getByLabelText('No');
      fireEvent.click(radioButtonNo);

      fixture.detectChanges();

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
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

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

    it('should set backlink to staff-summary-page page when not in staff record flow', async () => {
      const { component } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      expect(component.return).toEqual({
        url: ['/workplace', workplaceId, 'staff-record', workerId, 'staff-record-summary'],
      });
    });
  });
});
