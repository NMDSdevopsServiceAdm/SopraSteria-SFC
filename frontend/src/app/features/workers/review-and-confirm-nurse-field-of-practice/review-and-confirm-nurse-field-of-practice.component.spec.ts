import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ReviewAndConfirmNurseFieldOfPracticeComponent } from './review-and-confirm-nurse-field-of-practice.component';

fdescribe('ReviewAndConfirmNurseFieldOfPracticeComponent', () => {
  const mockWorkers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];

  const setup = async (overrides: any = {}) => {
    const workersToShow = overrides.workersToShow ?? mockWorkers;
    const routerSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    const setuptools = await render(ReviewAndConfirmNurseFieldOfPracticeComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: AlertService,
          useValue: { addAlert: () => {} },
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const fixture = setuptools.fixture;
    const component = fixture.componentInstance;
    fixture.autoDetectChanges();

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    const updateWorkersSpy = spyOn(establishmentService, 'updateWorkers').and.returnValue(of({}));
    const workerService = injector.inject(WorkerService);

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const router = injector.inject(Router) as Router;

    return {
      ...setuptools,
      component,
      fixture,
      establishmentService,
      workerService,
      alertServiceSpy,
      router,
      routerSpy,
      updateWorkersSpy,
    };
  };

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a heading and a caption (section heading)', async () => {
    const { getByRole, getByTestId } = await setup();

    const heading = getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain(
      "Review and confirm these nurses' Nursing and Midwifery Council fields of practice",
    );

    const sectionHeading = getByTestId('section-heading');
    expect(sectionHeading.textContent).toEqual('Staff records');
  });

  it('should show a link to nursing and midwifery council register', async () => {
    const { getByRole } = await setup();

    const expectedLinkText = /Search the Nursing and Midwifery Council register/;

    expect(getByRole('link', { name: expectedLinkText })).toBeTruthy();
  });
});
