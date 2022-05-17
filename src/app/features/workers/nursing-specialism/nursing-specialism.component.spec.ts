import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
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

const getNursingSpecialismComponent = async (worker, returnUrl = true) => {
  return render(NursingSpecialismComponent, {
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
        useFactory: returnUrl ? MockWorkerService.factory(worker) : MockWorkerServiceWithoutReturnUrl.factory(worker),
        deps: [HttpClient],
      },
      {
        provide: ActivatedRoute,
        useValue: {
          parent: {
            snapshot: {
              data: {
                establishment: { uid: 'mocked-uid' },
                primaryWorkplace: {},
              },
            },
          },
        },
      },
    ],
  });
};

describe('NursingSpecialismComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  it('should not select a radio button when worker has not answered question', async () => {
    const { getAllByRole } = await getNursingSpecialismComponent(workerBuilder());

    const answers = getAllByRole('radio') as any[];
    const checkedAnswers = answers.map((answer) => answer.checked);

    expect(checkedAnswers).not.toEqual(jasmine.arrayContaining([true]));
  });

  it('should pre-select the radio button when worker has answered question', async () => {
    const worker = workerWithNurseSpecialisms(false);
    const { fixture } = await getNursingSpecialismComponent(worker);

    const selectedRadioButton = fixture.nativeElement.querySelector(
      `input[ng-reflect-value="${worker.nurseSpecialisms.value}"]`,
    );

    expect(selectedRadioButton.checked).toBeTruthy();
  });

  it('should pre-select checkboxes when worker has nurse specialisms', async () => {
    const worker = workerWithNurseSpecialisms(true);
    const { fixture } = await getNursingSpecialismComponent(worker);

    const selectedCheckboxes = worker.nurseSpecialisms.specialisms.map((thisSpecialism) => {
      return fixture.nativeElement.querySelector(`input[value="${thisSpecialism.specialism}"]`);
    });

    selectedCheckboxes.forEach((checkbox) => expect(checkbox.checked).toBeTruthy());
  });

  it('should put updated worker nurse specialisms', async () => {
    const worker = workerWithNurseSpecialisms(false);
    const newNurseSpecialisms = workerWithNurseSpecialisms(true).nurseSpecialisms;
    const { fixture, getAllByRole } = await getNursingSpecialismComponent(worker);

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
    const { getAllByRole } = await getNursingSpecialismComponent(worker);

    const submit = getAllByRole('button')[0];

    fireEvent.click(submit);

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne(`/api/establishment/mocked-uid/worker/${worker.uid}`);

    expect(req.request.body).toEqual({ nurseSpecialisms: { value: null, specialisms: [] } });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const worker = workerBuilder();
      const { getByText } = await getNursingSpecialismComponent(worker, false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Exit' link if a return url is provided`, async () => {
      const worker = workerBuilder();
      const { getByText } = await getNursingSpecialismComponent(worker);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Exit')).toBeTruthy();
    });
  });
});
