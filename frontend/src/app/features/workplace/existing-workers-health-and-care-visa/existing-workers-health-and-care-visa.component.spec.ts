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
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { MockInternationalRecruitmentService } from '@core/test-utils/MockInternationalRecruitmentService';
import { WindowRef } from '@core/services/window.ref';
import { AlertService } from '@core/services/alert.service';
import { PermissionType } from '@core/model/permissions.model';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

fdescribe('ExistingWorkersHealthAndCareVisa', () => {
  async function setup(permissions = [], singleWorker = false) {
    const { fixture, getByText, getByTestId, getByRole } = await render(ExistingWorkersHealthAndCareVisa, {
      imports: [RouterTestingModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule, SharedModule],
      declarations: [DetailsComponent, SubmitExitButtonsComponent],
      providers: [
        UntypedFormBuilder,
        WindowRef,
        AlertService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[], true),
          deps: [HttpClient, Router],
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: InternationalRecruitmentService,
          useFactory: MockInternationalRecruitmentService.factory(singleWorker),
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const internationalRecruitmentService = injector.inject(
      InternationalRecruitmentService,
    ) as InternationalRecruitmentService;

    const internationalRecruitmentServiceSpy = spyOn(
      internationalRecruitmentService,
      'getAllWorkersNationalityAndBritishCitizenship',
    ).and.callThrough();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      fixture,
      component,
      getByText,
      getByTestId,
      getByRole,
      routerSpy,
      internationalRecruitmentServiceSpy,
      alertServiceSpy,
    };
  }

  it('should create the ExistingWorkersHealthAndCareVisa component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('heading', async () => {
    it('should be pluralised when we have more than one worker', async () => {
      const { component, fixture } = await setup();

      const headingText = fixture.nativeElement.querySelector('h1');
      expect(headingText.innerText).toContain('Are these workers on Health and Care Worker visas?');
    });

    it('should be singular when we have only one worker', async () => {
      const { component, fixture } = await setup([], true);

      const headingText = fixture.nativeElement.querySelector('h1');
      expect(headingText.innerText).toContain('Is this worker on a Health and Care Worker visa?');
    });
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

  it('should call getAllWorkersNationalityAndBritishCitizenship', async () => {
    const { component, fixture, internationalRecruitmentServiceSpy } = await setup(['canEditWorker']);

    component.canEditWorker = true;

    component.ngOnInit();
    fixture.detectChanges();

    expect(internationalRecruitmentServiceSpy).toHaveBeenCalledWith(component.workplaceUid);
  });

  it('should show the worker name', async () => {
    const { getByText } = await setup(['canEditWorker']);

    const workerName = getByText('Joy Wood');

    expect(workerName).toBeTruthy();
  });

  xit('should show the link to the worker staff record', async () => {
    const { component, getByText, routerSpy } = await setup(['canEditWorker']);

    const workerName = getByText(component.workers[0].name);
    fireEvent.click(workerName);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      component.workplaceUid,
      'staff-record',
      component.healthCareAndVisaWorkersList[0].uid,
      'staff-record-summary',
    ]);
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

  it('should not show anything selected when you land on the page', async () => {
    const { fixture } = await setup(['canEditWorker']);

    const yes = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-2"]');

    expect(yes.checked).toBeFalsy();
    expect(no.checked).toBeFalsy();
    expect(dontKnow.checked).toBeFalsy();
  });

  it('should select "Yes" when worker has a health and care visa', async () => {
    const { fixture } = await setup(['canEditWorker']);

    const yes = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-2"]');

    fireEvent.click(yes);
    fixture.detectChanges();

    expect(yes.checked).toBeTruthy();
    expect(no.checked).toBeFalsy();
    expect(dontKnow.checked).toBeFalsy();
  });

  it('should select "No" when worker does not have a health and care visa', async () => {
    const { fixture } = await setup(['canEditWorker']);

    const yes = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-2"]');

    fireEvent.click(no);
    fixture.detectChanges();

    expect(yes.checked).toBeFalsy();
    expect(no.checked).toBeTruthy();
    expect(dontKnow.checked).toBeFalsy();
  });

  it("should select 'Don't know' when worker is not known to have a health and care visa'", async () => {
    const { fixture } = await setup(['canEditWorker']);

    const yes = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-2"]');

    fireEvent.click(dontKnow);
    fixture.detectChanges();

    expect(yes.checked).toBeFalsy();
    expect(no.checked).toBeFalsy();
    expect(dontKnow.checked).toBeTruthy();
  });

  xit("should navigate to the home page if there are only 'No' or Don't know answered", async () => {
    const { fixture, getByText, routerSpy, alertServiceSpy } = await setup(['canEditWorker']);

    const yes = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-0"]');
    const no = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-1"]');
    const dontKnow = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-2"]');
    const continueButton = getByText('Continue');

    fireEvent.click(no);
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'home' });
    expect(alertServiceSpy).toHaveBeenCalledWith({
      type: 'success',
      message: 'Health and Care Worker visa information saved',
    });
  });
});
