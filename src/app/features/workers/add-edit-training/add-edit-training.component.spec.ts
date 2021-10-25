import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddEditTrainingComponent } from './add-edit-training.component';

describe('AddEditTrainingComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(AddEditTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              params: { trainingRecordId: '1' },
            },
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: '1',
                  },
                },
              },
            },
          }),
        },
        FormBuilder,
        ErrorSummaryService,
        { provide: TrainingService, useClass: MockTrainingService },
        { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
