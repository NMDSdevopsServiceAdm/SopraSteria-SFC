import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService, MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { BritishCitizenshipComponent } from './british-citizenship.component';

describe('BritishCitizenshipComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, queryByTestId, getByLabelText, getByTestId } = await render(
      BritishCitizenshipComponent,
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
            useClass: returnUrl ? MockWorkerService : MockWorkerServiceWithoutReturnUrl,
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
      routerSpy,
      getByText,
      queryByTestId,
      getByLabelText,
      getByTestId,
    };
  }

  it('should render the BritishCitizenshipComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the GenderComponent heading, subheading and radio buttons', async () => {
    const { getByText, getByLabelText, getByTestId } = await setup();

    expect(getByText('Do they have British citizenship?')).toBeTruthy;
    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByLabelText('Yes')).toBeTruthy();
    expect(getByLabelText('No')).toBeTruthy();
    expect(getByLabelText('I do not know')).toBeTruthy();
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

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup(false);

      expect(getByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  describe('navigation', () => {
    it('should navigate to country-of-birth page when submitting from flow', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      expect(getByText('Save and continue')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'country-of-birth']);
    });

    it('should navigate to country-of-birth page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'country-of-birth']);
    });

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Save and return');
      fireEvent.click(skipButton);

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

      const skipButton = getByText('Cancel');
      fireEvent.click(skipButton);

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

      console.log(component.return);

      expect(component.return).toEqual({
        url: ['/workplace', workplaceId, 'staff-record', workerId, 'staff-record-summary'],
      });
    });
  });
});
