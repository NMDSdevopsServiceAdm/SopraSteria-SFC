import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { Observable, of } from 'rxjs';

const { build, fake, sequence, perBuild, oneOf } = require('@jackfranklin/test-data-bot');

const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    nameOrId: fake((f) => f.name.findName()),
    mainJob: {
      id: sequence(),
      title: fake((f) => f.lorem.sentence()),
      other: null
    },
    contract: oneOf('Permanent', 'Temporary', 'Pool or Bank', 'Agency', 'Other'),
    localIdentifier: fake((f) => f.name.findName()),
    zeroHoursContract: oneOf('Yes', 'No', 'Don\'t know'),
    weeklyHoursAverage: null,
    weeklyHoursContracted: {
      value: 'Yes',
      hours: fake((f) => f.random.number())
    },
    annualHourlyPay: {
      value: 'Hourly',
      rate: 8.98
    },
    careCertificate: 'Yes',
    apprenticeshipTraining: null,
    qualificationInSocialCare: 'Yes',
    otherQualification: 'No',
    highestQualification: null,
    registeredNurse: 'Yes',
    socialCareQualification: {
      qualificationId: 1,
    },
    nurseSpecialism: null,
    wdfEligible: false,
    trainingCount: 0,
    expiredTrainingCount: 0,
    expiringTrainingCount: 0,
    missingMandatoryTrainingCount: 0,
    qualificationCount: 0
  }
});

const worker = workerBuilder();

export class MockWorkerService extends WorkerService {
  public worker$ = of(worker as Worker);

  getAllWorkers(establishmentUid: string): Observable<Worker[]> {
    return of([
      {
        trainingCount: 1,
        trainingLastUpdated: '2020-01-01T00:00:00Z'
      }
    ] as Worker[]);
  }
}
