import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { FluJabComponent } from './flu-jab.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';

const { build, fake, sequence, oneOf } = require('@jackfranklin/test-data-bot');

const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    name: fake((f) => f.name.findName()),
    fluJab: null
  }
});

const workerWithFluJab = () => workerBuilder({
  overrides: {
    fluJab: oneOf('Yes', 'No', `Don't know`)
  }
});

const getFluJabComponent = async () => {
  return render(FluJabComponent, {
    imports: [
      FormsModule,
      ReactiveFormsModule,
      HttpClientTestingModule,
      SharedModule,
      RouterTestingModule
    ],
    providers: [
      {
        provide: WindowRef,
        useClass: WindowRef
      },
      {
        provide: EstablishmentService,
        useClass: MockEstablishmentService
      }
    ],
  });
}

const setup = async (workers) => {
  const httpTestingController = TestBed.inject(HttpTestingController);
  const req = httpTestingController.expectOne('/api/establishment/mocked-uid/fluJab');
  req.flush(workers);
}

fdescribe('FluJabComponent', () => {
  afterEach(() => {
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.verify();
  });

  it('should show each workplace worker flu jab', async () => {
    const worker = workerBuilder();

    const { fixture, getByText } = await getFluJabComponent();

    await setup([worker]);

    fixture.detectChanges();

    expect(getByText(worker.name));
  })

  it('should not select a radio button when worker has not answered question', async () => {
    const worker = workerBuilder();

    const { fixture, getAllByRole } = await getFluJabComponent();

    await setup([worker]);

    fixture.detectChanges();

    const answers = getAllByRole('radio') as any[];
    const checkedAnswers = answers.map(answer => answer.checked);

    expect(checkedAnswers).not.toEqual(jasmine.arrayContaining([true]));
  })

  it('should pre-select the radio buttons with workers flu jabs', async () => {
    const worker = workerWithFluJab();

    const { fixture } = await getFluJabComponent();

    await setup([worker]);

    fixture.detectChanges();

    const selectedRadioButton = fixture.nativeElement.querySelector(`input[value="${worker.fluJab}"]`);

    expect(selectedRadioButton.checked).toBeTruthy();
  })

  it('should put all worker flu jabs', async () => {
    const firstWorker = workerBuilder();
    const secondWorker = workerWithFluJab();

    const { fixture, click, getAllByRole } = await getFluJabComponent();

    await setup([firstWorker, secondWorker]);

    fixture.detectChanges();

    const yes = fixture.nativeElement.querySelector('input[id="fluJab-0-0"]');
    const submit = getAllByRole('button')[0];

    click(yes);
    click(submit);

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne('/api/establishment/mocked-uid/workers');

    expect(req.request.body).toEqual([
      {
        "id": firstWorker.id,
        "uid": firstWorker.uid,
        "fluJab": "Yes"
      },
      {
        "id": secondWorker.id,
        "uid": secondWorker.uid,
        "fluJab": secondWorker.fluJab
      }
    ])
  })
});
