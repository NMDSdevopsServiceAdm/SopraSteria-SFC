import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ExpiredTrainingComponent } from './expired-training.component';

describe('ExiredTrainingComponent', () => {
  async function setup() {
    const component = await render(ExpiredTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        BackService,
        // {
        //   provide: EstablishmentService,
        //   useClass: MockEstablishmentService,
        // },
        // {
        //   provide: TrainingService,
        //   useClass: preselectedStaff ? MockTrainingServiceWithPreselectedStaff : MockTrainingService,
        // },
        // {
        //   provide: ActivatedRoute,
        //   useValue: {
        //     snapshot: {
        //       data: {
        //         workers: {
        //           workers: AllWorkers,
        //         },
        //       },
        //       params: {
        //         establishmentuid: '1234-5678',
        //       },
        //     },
        //   },
        // },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      spy,
    };
  }

  it('should render a ExpiredTrainingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
