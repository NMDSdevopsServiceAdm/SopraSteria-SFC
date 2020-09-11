import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { render, getByRole } from '@testing-library/angular';
import { WorkerService } from '../../../core/services/worker.service';
import { MockWorkerService } from '../../../core/test-utils/MockWorkerService';
import { FluJabComponent } from './flu-jab.component';

import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { StaffSummaryComponent } from '@shared/components/staff-summary/staff-summary.component';

const { build, fake, sequence, oneOf } = require('@jackfranklin/test-data-bot');

const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    nameOrId: fake((f) => f.name.findName()),
    // TODO: work out why this breaks the mandatory tests
    mainJob: {
      id: sequence(),
      title: fake((f) => f.lorem.sentence()),
      other: null
    },
    fluJab: null
  }
});

const workerWithFluJab = () => workerBuilder({
  overrides: {
    fluJab: oneOf('Yes', 'No', `Don't know`)
  }
});

const getFluJabComponent = async (worker) => {
  return render(FluJabComponent, {
    imports: [
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      SharedModule,
      RouterTestingModule.withRoutes([
        { path: 'dashboard', component: StaffSummaryComponent }
      ]),
    ],
    providers: [
      {
        provide: WorkerService,
        useFactory: MockWorkerService.factory(worker),
        deps: [HttpClient]
      },
      {
        provide: ActivatedRoute,
        useValue:
        {
          parent:
          {
            snapshot:
            {
              data: {
                establishment: { uid: 'mocked-uid' },
                primaryWorkplace: {}
              }
            }
          }
        }
      }
    ]
  });
}

fdescribe('FluJabComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  it('should not select a radio button when worker has not answered question', async () => {
    const { getAllByRole } = await getFluJabComponent(workerBuilder());

    const answers = getAllByRole('radio') as any[];
    const checkedAnswers = answers.map(answer => answer.checked);

    expect(checkedAnswers).not.toEqual(jasmine.arrayContaining([true]));
  })

  it('should pre-select the radio button with worker flu jab', async () => {
    const worker = workerWithFluJab();
    const { fixture } = await getFluJabComponent(worker);

    const selectedRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="${worker.fluJab}"]`);

    expect(selectedRadioButton.checked).toBeTruthy();
  })

  it('should put updated worker flu jab', async () => {
    const worker = workerBuilder();
    const newFluJab = workerWithFluJab().fluJab;
    const { fixture, click, getAllByRole } = await getFluJabComponent(worker);

    const selectedRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="${newFluJab}"]`);
    const submit = getAllByRole('button')[0];

    click(selectedRadioButton);
    click(submit);

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne(`/api/establishment/mocked-uid/worker/${worker.uid}`);

    expect(req.request.body).toEqual({ fluJab: newFluJab })
  })

  it('should put flu jab null when question not answered', async () => {
    const worker = workerBuilder();
    const { click, getAllByRole } = await getFluJabComponent(worker);

    const submit = getAllByRole('button')[0];

    click(submit);

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne(`/api/establishment/mocked-uid/worker/${worker.uid}`);

    expect(req.request.body).toEqual({ fluJab: null })
  })
});
