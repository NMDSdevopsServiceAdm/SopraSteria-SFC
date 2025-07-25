import { ActivatedRoute, provideRouter, RouterModule } from '@angular/router';
import { CarryOutDelegatedHealthcareActivitiesComponent } from './carry-out-delegated-healthcare-activities.component';
import { render, within } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkersModule } from '../workers.module';
import { DetailsComponent } from '@shared/components/details/details.component';
import { UntypedFormBuilder } from '@angular/forms';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { HttpClient } from '@angular/common/http';

fdescribe('CarryOutDelegatedHealthcareActivitiesComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(CarryOutDelegatedHealthcareActivitiesComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, WorkersModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: overrides.insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                data: {
                  establishment: { uid: 'mocked-uid' },
                  primaryWorkplace: {},
                },
              },
            },
            snapshot: {
              params: {},
            },
          },
        },
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithOverrides.factory(overrides.workerService ?? {}),
          deps: [HttpClient],
        },
      ],
    });
    const component = setupTools.fixture.componentInstance;
    return { ...setupTools, component };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a heading and caption', async () => {
    const { getByRole, getByTestId } = await setup();

    expect(getByRole('heading', { level: 1 }).textContent).toContain(
      'Do they carry out delegated healthcare activities?',
    );

    const sectionHeading = getByTestId('section-heading');

    expect(sectionHeading).toBeTruthy();
    expect(sectionHeading.textContent).toEqual('Employment details');
  });

  describe('Form', () => {});

  describe('When in add new worker flow', () => {
    const overrides = { insideFlow: true };

    it('should show a progress bar', async () => {
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should show a "Save and continue" cta button and "Skip this question" link', async () => {
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });
  });
});
