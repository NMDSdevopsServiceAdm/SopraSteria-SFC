import { fireEvent, render } from '@testing-library/angular';
import { ExistingWorkersHealthAndCareVisa } from './existing-workers-health-and-care-visa.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailsComponent } from '@shared/components/details/details.component';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { getTestBed } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';
import { SubmitExitButtonsComponent } from '@shared/components/submit-exit-buttons/submit-exit-buttons.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

fdescribe('ExistingWorkersHealthAndCareVisa', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, getByRole } = await render(ExistingWorkersHealthAndCareVisa, {
      imports: [RouterTestingModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule, SharedModule],
      declarations: [DetailsComponent, SubmitExitButtonsComponent],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      fixture,
      component,
      getByText,
      getByTestId,
      getByRole,
      routerSpy,
    };
  }

  it('should create the ExistingWorkersHealthAndCareVisa component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { component, fixture } = await setup();

    const headingText = fixture.nativeElement.querySelector('h1');
    expect(headingText.innerText).toContain('Are these workers on Health and Care Worker visas?');
  });

  it('should render the reveal', async () => {
    const { getByTestId } = await setup();

    const reveal = getByTestId('reveal-WhyWeAsk');

    expect(reveal).toBeTruthy();
  });

  it('should show a link to staff records', async () => {
    const { fixture, getByText, routerSpy } = await setup();

    const staffRecordsLink = getByText('staff records');
    fireEvent.click(staffRecordsLink);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
  });

  it('should show the worker name', async () => {
    const { getByText } = await setup();

    const workerName = getByText('Henry Adams');

    expect(workerName).toBeTruthy();
  });

  it('should show the continue button', async () => {
    const { getByText } = await setup();

    const continueButton = getByText('Continue');

    expect(continueButton).toBeTruthy();
  });

  it('should show the cancel link', async () => {
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
  });
});
