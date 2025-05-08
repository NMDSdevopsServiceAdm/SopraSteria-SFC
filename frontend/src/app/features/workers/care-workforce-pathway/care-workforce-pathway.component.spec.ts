import { render } from '@testing-library/angular';
import { CareWorkforcePathwayComponent } from './care-workforce-pathway.component';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { WorkersModule } from '../workers.module';
import { WindowRef } from '@core/services/window.ref';
import { AlertService } from '@core/services/alert.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';
import { MockQualificationService } from '@core/test-utils/MockQualificationsService';
import {
  MockWorkerServiceWithUpdateWorker,
  MockWorkerServiceWithoutReturnUrl,
} from '@core/test-utils/MockWorkerService';

describe('CareWorkforcePathwayComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(CareWorkforcePathwayComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, WorkersModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: overrides.returnUrl ? 'staff-record-summary' : 'staff-uid' }],
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
          useClass: overrides.returnUrl ? MockWorkerServiceWithUpdateWorker : MockWorkerServiceWithoutReturnUrl,
        },
        {
          provide: QualificationService,
          useClass: MockQualificationService,
        },
        AlertService,
        WindowRef,
      ],
    });
    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading and caption', async () => {
    const { getByText } = await setup();

    expect(getByText('Training and qualifications')).toBeTruthy();
    expect(getByText('Where are they currently on the care workforce pathway?')).toBeTruthy;
  });
});
