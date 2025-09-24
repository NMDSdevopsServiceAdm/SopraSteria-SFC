import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import {
  MockInternationalRecruitmentService,
  singleInternationalRecruitmentWorker,
  internationalRecruitmentWorkers,
} from '@core/test-utils/MockInternationalRecruitmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { DetailsComponent } from '@shared/components/details/details.component';
import { SubmitExitButtonsComponent } from '@shared/components/submit-exit-buttons/submit-exit-buttons.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { HealthAndCareVisaExistingWorkers } from './health-and-care-visa-existing-workers.component';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { MockPreviousRouteService } from '@core/test-utils/MockPreviousRouteService';

let outsideOrInsideUkUrl = `/workplace/mocked-uid/employed-from-outside-or-inside-uk`;

describe('HealthAndCareVisaExistingWorkers', () => {
  async function setup(
    permissions = [],
    singleWorker = false,
    prefilledWorkers = null,
    previousUrl = '/dashboard#home',
  ) {
    const { fixture, getByText, getByTestId, getByRole, queryByText } = await render(HealthAndCareVisaExistingWorkers, {
      imports: [RouterTestingModule, FormsModule, ReactiveFormsModule, SharedModule],
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
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router],
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: InternationalRecruitmentService,
          useFactory: MockInternationalRecruitmentService.factory(singleWorker, {
            workplaceUid: 'mocked-uid',
            healthAndCareVisaWorkerAnswers: prefilledWorkers,
          }),
        },
        {
          provide: PreviousRouteService,
          useFactory: MockPreviousRouteService.factory(previousUrl),
          deps: [Router],
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'updateWorkers').and.returnValue(of({}));

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const internationalRecruitmentService = injector.inject(
      InternationalRecruitmentService,
    ) as InternationalRecruitmentService;

    const getAllWorkersNationalityAndBritishCitizenshipSpy = spyOn(
      internationalRecruitmentService,
      'getAllWorkersNationalityAndBritishCitizenship',
    ).and.callThrough();
    const setInternationalRecruitmentWorkerAnswersSpy = spyOn(
      internationalRecruitmentService,
      'setInternationalRecruitmentWorkerAnswers',
    ).and.callThrough();

    const getInternationalRecruitmentWorkerAnswersSpy = spyOn(
      internationalRecruitmentService,
      'getInternationalRecruitmentWorkerAnswers',
    ).and.callThrough();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      fixture,
      component,
      getByText,
      getByTestId,
      getByRole,
      queryByText,
      routerSpy,
      getAllWorkersNationalityAndBritishCitizenshipSpy,
      setInternationalRecruitmentWorkerAnswersSpy,
      alertServiceSpy,
      establishmentServiceSpy,
      getInternationalRecruitmentWorkerAnswersSpy,
    };
  }

  it('should create the ExistingWorkersHealthAndCareVisa component', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('heading', async () => {
    it('should be pluralised when we have more than one worker', async () => {
      const { component, fixture } = await setup(['canEditWorker']);

      const headingText = fixture.nativeElement.querySelector('h1');
      expect(headingText.innerText).toContain('Are these workers on Health and Care Worker visas?');
    });

    it('should be singular when we have only one worker', async () => {
      const { component, fixture } = await setup(['canEditWorker'], true);

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
    const { component, fixture, getAllWorkersNationalityAndBritishCitizenshipSpy } = await setup(['canEditWorker']);

    component.canEditWorker = true;

    component.ngOnInit();
    fixture.detectChanges();

    expect(getAllWorkersNationalityAndBritishCitizenshipSpy).toHaveBeenCalledWith(component.workplaceUid);
  });

  it("should not show the worker name if they don't have permissions", async () => {
    const { queryByText } = await setup();

    const workerName = queryByText('Joy Wood');

    expect(workerName).toBeFalsy();
  });

  it('should show the worker name', async () => {
    const { getByText } = await setup(['canEditWorker']);

    const workerName = getByText('Joy Wood');

    expect(workerName).toBeTruthy();
  });

  it('should show the link to the worker staff record', async () => {
    const { component, getByText, routerSpy } = await setup(['canEditWorker']);

    const workerName = getByText(component.workers[0].name);
    fireEvent.click(workerName);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      component.workplaceUid,
      'staff-record',
      component.workers[0].uid,
      'staff-record-summary',
    ]);
  });

  it('should show the continue button', async () => {
    const { getByText } = await setup();

    const continueButton = getByText('Continue');

    expect(continueButton).toBeTruthy();
  });

  it('should show a cancel link with ref for home page', async () => {
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink.getAttribute('href')).toEqual('/dashboard#home');
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

  describe('navigation', () => {
    it("should navigate to 'employed-from-outside-or-inside-uk' if there only 'Yes' answered", async () => {
      const { component, fixture, getByText, routerSpy, setInternationalRecruitmentWorkerAnswersSpy } = await setup([
        'canEditWorker',
      ]);

      const yes1 = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-1-0"]');
      const yes2 = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-2-0"]');
      const continueButton = getByText('Continue');

      fireEvent.click(yes1);
      fireEvent.click(yes2);
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        'workplace',
        component.workplaceUid,
        'employed-from-outside-or-inside-uk',
      ]);
      expect(setInternationalRecruitmentWorkerAnswersSpy).toHaveBeenCalled();
    });

    it("should navigate to 'employed-from-outside-or-inside-uk' if there are 'Yes', 'No' and Don't know  answered", async () => {
      const { component, fixture, getByText, routerSpy, setInternationalRecruitmentWorkerAnswersSpy } = await setup([
        'canEditWorker',
      ]);

      const yes3 = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-3-0"]');
      const dontKnow1 = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-1-2"]');
      const no2 = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-2-1"]');

      const continueButton = getByText('Continue');

      fireEvent.click(yes3);
      fireEvent.click(dontKnow1);
      fireEvent.click(no2);

      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        'workplace',
        component.workplaceUid,
        'employed-from-outside-or-inside-uk',
      ]);
      expect(setInternationalRecruitmentWorkerAnswersSpy).toHaveBeenCalled();
    });

    it("should navigate to the home page if there are only 'No' or Don't know answered", async () => {
      const { fixture, getByText, routerSpy, alertServiceSpy, establishmentServiceSpy } = await setup([
        'canEditWorker',
      ]);

      const no0 = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-1"]');
      const dontKnow1 = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-1-2"]');
      const continueButton = getByText('Continue');

      fireEvent.click(no0);
      fireEvent.click(dontKnow1);
      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(establishmentServiceSpy).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'home' });

      fixture.whenStable().then(() => {
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Health and Care Worker visa information saved',
        });
      });
    });

    it('should navigate to the home page if no answers have been selected', async () => {
      const { fixture, getByText, routerSpy, alertServiceSpy, establishmentServiceSpy } = await setup([
        'canEditWorker',
      ]);

      const continueButton = getByText('Continue');

      fireEvent.click(continueButton);
      fixture.detectChanges();

      expect(establishmentServiceSpy).not.toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'home' });
      expect(alertServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('When data in international recruitment service after navigating back from inside or outside uk page, ', () => {
    const expectRadioButtonToBePrefilled = (fixture, radioIndex: number) => {
      const yes = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-0"]');
      const no = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-1"]');
      const dontKnow = fixture.nativeElement.querySelector('input[id="healthAndCareVisa-0-2"]');
      const radioButtons = [yes, no, dontKnow];

      radioButtons.forEach((radio, index) => {
        radioIndex === index ? expect(radio.checked).toBeTruthy() : expect(radio.checked).toBeFalsy();
      });
    };

    it('should prefill Yes for worker when worker has healthAndCareVisa set to Yes', async () => {
      const singleWorker = singleInternationalRecruitmentWorker();
      singleWorker[0].healthAndCareVisa = 'Yes';

      const { fixture } = await setup(['canEditWorker'], true, singleWorker, outsideOrInsideUkUrl);

      expectRadioButtonToBePrefilled(fixture, 0);
    });

    it('should prefill No for worker when worker has healthAndCareVisa set to No', async () => {
      const singleWorker = singleInternationalRecruitmentWorker();
      singleWorker[0].healthAndCareVisa = 'No';

      const { fixture } = await setup(['canEditWorker'], true, singleWorker, outsideOrInsideUkUrl);

      expectRadioButtonToBePrefilled(fixture, 1);
    });

    it("should prefill Don't know when worker has healthAndCareVisa set to Don't know", async () => {
      const singleWorker = singleInternationalRecruitmentWorker();
      singleWorker[0].healthAndCareVisa = "Don't know";

      const { fixture } = await setup(['canEditWorker'], true, singleWorker, outsideOrInsideUkUrl);

      expectRadioButtonToBePrefilled(fixture, 2);
    });
  });

  describe('When coming from another page', () => {
    it('should set values if the previous page was not outside or inside uk', async () => {
      const multipleWorkers = internationalRecruitmentWorkers();
      const { component, fixture, getInternationalRecruitmentWorkerAnswersSpy } = await setup(
        ['canEditWorker'],
        false,
        multipleWorkers,
        outsideOrInsideUkUrl,
      );
      component.canEditWorker = true;
      component.ngOnInit();
      fixture.detectChanges();
      expect(getInternationalRecruitmentWorkerAnswersSpy).toHaveBeenCalled();
      let formValues = component.form.value.healthAndCareVisaRadioList;
      multipleWorkers.forEach((worker, index) => {
        if (formValues[multipleWorkers[index].uid].healthAndCareVisa !== null) {
          expect(formValues[multipleWorkers[index].uid].healthAndCareVisa).toBeTruthy();
        }
      });
    });
    it('should not set values if the previous page was not outside or inside uk', async () => {
      const multipleWorkers = internationalRecruitmentWorkers();
      const { component, fixture, getInternationalRecruitmentWorkerAnswersSpy } = await setup(
        ['canEditWorker'],
        false,
        multipleWorkers,
      );
      component.canEditWorker = true;
      component.ngOnInit();
      fixture.detectChanges();
      expect(getInternationalRecruitmentWorkerAnswersSpy).not.toHaveBeenCalled();
      let formValues = component.form.value.healthAndCareVisaRadioList;
      multipleWorkers.forEach((worker, index) => {
        expect(formValues[multipleWorkers[index].uid].healthAndCareVisa).toBeFalsy();
      });
    });
  });
});