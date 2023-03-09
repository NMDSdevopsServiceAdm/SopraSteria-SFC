import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { WorkerService } from '@core/services/worker.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { NewStaffTabComponent } from './staff-tab.component';

describe('NewStaffTabComponent', () => {
  const setup = async () => {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByTestId } = await render(NewStaffTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
      ],
      declarations: [],
      componentProperties: {
        workplace: establishment,
        workers: [],
      },
    });

    const component = fixture.componentInstance;

    const workerService = TestBed.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setAddStaffRecordInProgress');

    return {
      component,
      getByTestId,
      workerSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the no staff records section if there are no staff records', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('no-staff-records')).toBeTruthy();
  });

  it('should call setAddStaffRecordInProgress when initialising component', async () => {
    const { component, workerSpy } = await setup();

    component.ngOnInit();
    expect(workerSpy).toHaveBeenCalledWith(false);
  });
});
