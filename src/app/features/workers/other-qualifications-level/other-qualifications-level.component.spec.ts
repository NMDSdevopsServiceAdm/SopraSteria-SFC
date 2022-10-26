import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';
import { MockQualificationService } from '@core/test-utils/MockQualificationsService';
import {
  MockWorkerServiceWithoutReturnUrl,
  MockWorkerServiceWithUpdateWorker,
  workerBuilder,
} from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { OtherQualificationsLevelComponent } from './other-qualifications-level.component';

describe('OtherQualificationsLevelComponent', () => {
  const workplace = establishmentBuilder() as Establishment;
  const worker = workerBuilder() as Worker;

  async function setup(returnUrl = true) {
    const { fixture, getByText, queryByTestId, getByLabelText, getByTestId } = await render(
      OtherQualificationsLevelComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
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
                  url: [{ path: returnUrl ? 'staff-record-summary' : 'mocked-uid' }],
                },
              },
            },
          },
          {
            provide: WorkerService,
            useClass: returnUrl ? MockWorkerServiceWithUpdateWorker : MockWorkerServiceWithoutReturnUrl,
          },
          {
            provide: QualificationService,
            useClass: MockQualificationService,
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

  it('should render a OtherQualificationsLevelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the OtherQualificationsLevelComponent heading, subheading and select box', async () => {
    const { getByText, getByLabelText, getByTestId } = await setup();

    expect(getByText(`What's the highest level of their other qualifications?`)).toBeTruthy;
    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByLabelText('Qualification level')).toBeTruthy();
  });

  describe('submit buttons', () => {
    it('should render the page with a save and continue button when there return value is null', async () => {
      const { component, fixture, getByText } = await setup(false);

      component.return = null;
      fixture.detectChanges();

      const button = getByText('Save and continue');
      const viewRecordLink = getByText('View this staff record');

      expect(button).toBeTruthy();
      expect(viewRecordLink).toBeTruthy();
    });

    it('should render the page with a save and return button and an cancel link when there is a return value', async () => {
      const { getByText } = await setup();

      const button = getByText('Save and return');
      const exitLink = getByText('Cancel');

      expect(button).toBeTruthy();
      expect(exitLink).toBeTruthy();
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
    it('should navigate to staff-record-summary page when submitting from flow', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const select = getByLabelText('Qualification level', { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-record-summary page when skipping the question in the flow', async () => {
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
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const select = getByLabelText('Qualification level', { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const skipButton = getByText('Save and return');
      fireEvent.click(skipButton);
      fixture.detectChanges();

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
  });
});
