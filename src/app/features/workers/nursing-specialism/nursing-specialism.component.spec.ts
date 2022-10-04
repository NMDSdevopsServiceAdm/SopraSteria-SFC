import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { StaffSummaryComponent } from '@shared/components/staff-summary/staff-summary.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkerService } from '../../../core/services/worker.service';
import { MockWorkerService, MockWorkerServiceWithoutReturnUrl } from '../../../core/test-utils/MockWorkerService';
import { NursingSpecialismComponent } from './nursing-specialism.component';

const { build, fake, oneOf } = require('@jackfranklin/test-data-bot');

const workerBuilder = build('Worker', {
  fields: {
    uid: fake((f) => f.datatype.uuid()),
    mainJob: {
      id: 23,
      jobId: 23,
    },
    nurseSpecialisms: null,
  },
});

const workerWithNurseSpecialisms = (hasSpecialisms) =>
  workerBuilder({
    overrides: {
      nurseSpecialisms: {
        value: hasSpecialisms ? 'Yes' : oneOf(`Don't know`, 'No'),
        specialisms: hasSpecialisms
          ? [
              {
                specialism: oneOf(
                  'Older people (including dementia, elderly care and end of life care)',
                  'Adults',
                  'Learning Disability',
                ),
              },
              { specialism: oneOf('Mental Health', 'Community Care', 'Others') },
            ]
          : [],
      },
    },
  });
describe('NursingSpecialismComponent', () => {
  async function setup(worker, insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId, getAllByRole } = await render(
      NursingSpecialismComponent,
      {
        imports: [
          FormsModule,
          ReactiveFormsModule,
          HttpClientTestingModule,
          SharedModule,
          RouterTestingModule.withRoutes([{ path: 'dashboard', component: StaffSummaryComponent }]),
        ],
        providers: [
          {
            provide: WorkerService,
            useFactory: insideFlow
              ? MockWorkerServiceWithoutReturnUrl.factory(worker)
              : MockWorkerService.factory(worker),
            deps: [HttpClient],
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
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const backService = injector.inject(BackService);

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const backLinkSpy = spyOn(backService, 'setBackLink');

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      routerSpy,
      getByTestId,
      queryByTestId,
      backLinkSpy,
      getAllByRole,
    };
  }

  it('should not select a radio button when worker has not answered question', async () => {
    const { getAllByRole } = await setup(workerBuilder());

    const answers = getAllByRole('radio') as any[];
    const checkedAnswers = answers.map((answer) => answer.checked);

    expect(checkedAnswers).not.toEqual(jasmine.arrayContaining([true]));
  });

  it('should pre-select the radio button when worker has answered question', async () => {
    const worker = workerWithNurseSpecialisms(false);
    const { fixture } = await setup(worker);

    const selectedRadioButton = fixture.nativeElement.querySelector(
      `input[ng-reflect-value="${worker.nurseSpecialisms.value}"]`,
    );

    expect(selectedRadioButton.checked).toBeTruthy();
  });

  it('should pre-select checkboxes when worker has nurse specialisms', async () => {
    const worker = workerWithNurseSpecialisms(true);
    const { fixture } = await setup(worker);

    const selectedCheckboxes = worker.nurseSpecialisms.specialisms.map((thisSpecialism) => {
      return fixture.nativeElement.querySelector(`input[value="${thisSpecialism.specialism}"]`);
    });

    selectedCheckboxes.forEach((checkbox) => expect(checkbox.checked).toBeTruthy());
  });

  it('should put updated worker nurse specialisms', async () => {
    const worker = workerWithNurseSpecialisms(false);
    const newNurseSpecialisms = workerWithNurseSpecialisms(true).nurseSpecialisms;
    const { fixture, getAllByRole } = await setup(worker, false);

    const yesRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="Yes"]`);
    fireEvent.click(yesRadioButton);

    newNurseSpecialisms.specialisms.forEach((thisSpecialism) => {
      const checkbox = fixture.nativeElement.querySelector(`input[value="${thisSpecialism.specialism}"]`);
      fireEvent.click(checkbox);
    });

    const submit = getAllByRole('button')[0];
    fireEvent.click(submit);

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne(`/api/establishment/mocked-uid/worker/${worker.uid}`);

    expect(req.request.body).toEqual({ nurseSpecialisms: newNurseSpecialisms });
  });

  it('should put nurse specialisms null when question not answered', async () => {
    const worker = workerBuilder();
    const { getAllByRole } = await setup(worker, false);

    const submit = getAllByRole('button')[0];

    fireEvent.click(submit);

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne(`/api/establishment/mocked-uid/worker/${worker.uid}`);

    expect(req.request.body).toEqual({ nurseSpecialisms: { value: null, specialisms: [] } });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' and skip this question  link, if a return url is not provided`, async () => {
      const worker = workerBuilder();
      const { getByText } = await setup(worker);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const worker = workerBuilder();
      const { getByText } = await setup(worker, false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
      const worker = workerWithNurseSpecialisms(true);
      const { component, getByText, routerSpy } = await setup(worker);

      const button = getByText('Save and continue');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'recruited-from',
      ]);
    });

    it(`should navigate to  'recruited-from' page when skipping the question in the flow`, async () => {
      const worker = workerWithNurseSpecialisms(true);
      const { component, routerSpy, getByText } = await setup(worker);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'recruited-from']);
    });

    it(`should navigate to 'staff-summary-page' page when clicking 'View this staff record' link `, async () => {
      const worker = workerBuilder();
      const { component, routerSpy, getByText } = await setup(worker);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const viewStaffRecord = getByText('View this staff record');
      fireEvent.click(viewStaffRecord);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const worker = workerBuilder();
      const { component, routerSpy, getByText } = await setup(worker, false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });
  });

  describe('setBackLink()', () => {
    it('should set the backlink to nursing-category, when in the flow ', async () => {
      const worker = workerWithNurseSpecialisms(true);
      const { component, backLinkSpy } = await setup(worker);

      component.initiated = false;
      component.ngOnInit();
      component.setBackLink();
      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/workplace', component.workplace.uid, 'staff-record', component.worker.uid, 'nursing-category'],
        fragment: 'staff-records',
      });
    });

    it('should set the backlink to staff-record-summary, when not in the flow', async () => {
      const worker = workerWithNurseSpecialisms(true);
      const { component, backLinkSpy } = await setup(worker, false);

      component.setBackLink();
      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/workplace', component.workplace.uid, 'staff-record', component.worker.uid, 'staff-record-summary'],
        fragment: 'staff-records',
      });
    });
  });
});
