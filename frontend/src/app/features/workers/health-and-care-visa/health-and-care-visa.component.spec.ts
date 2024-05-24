import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { HealthAndCareVisaComponent } from './health-and-care-visa.component';

describe('HealthAndCareVisaComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture } = await render(HealthAndCareVisaComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: WorkerService,
          useClass: MockWorkerServiceWithUpdateWorker,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: { uid: 'mocked-uid' },
                },
                url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
              },
            },
            snapshot: {
              params: {},
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    return {
      component,
    };
  }

  it('should render the CountryOfBirthComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
