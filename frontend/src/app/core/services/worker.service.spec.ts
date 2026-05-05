import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { WorkerService } from './worker.service';
import { build, fake, oneOf } from '@jackfranklin/test-data-bot';
import { provideHttpClient } from '@angular/common/http';

describe('WorkerService', () => {
  let service: WorkerService;
  let http: HttpTestingController;

  const workerBuilder = build('Worker', {
    fields: {
      uid: fake((f) => f.datatype.uuid()),
      contract: 'Permanent',
      mainJob: {
        id: 20,
        jobId: 20,
      },
      created: fake((f) => f.datatype.datetime()),
      updated: fake((f) => f.datatype.datetime()),
      updatedBy: 'admin3',
      completed: oneOf(true, false),
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [WorkerService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WorkerService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('hasNonMandatoryQuestionAnswered', () => {
    it('should return false if the current worker only has mandatory info', async () => {
      const mockWorker = workerBuilder();
      service.setState(mockWorker);

      expect(service.hasAnsweredNonMandatoryQuestion()).toBe(false);
    });

    it('should return true if the current worker has non-mandatory question answered', async () => {
      const mockWorker = { ...workerBuilder(), dateOfBirth: '2000-01-01' };
      service.setState(mockWorker);

      expect(service.hasAnsweredNonMandatoryQuestion()).toBe(true);
    });

    it('should return true even if the current worker has several non-mandatory questions answered', async () => {
      const mockWorker = {
        ...workerBuilder(),
        dateOfBirth: '2000-01-01',
        recruitedFrom: {
          value: 'Yes',
          from: {
            recruitedFromId: 1,
            from: 'Adult care sector: local authority',
          },
        },
        daysSick: {
          value: 'Yes',
          days: 5,
        },
      };
      service.setState(mockWorker);

      expect(service.hasAnsweredNonMandatoryQuestion()).toBe(true);
    });
  });

  describe('selectedDownloadTrainAndQualsAnswer', () => {
    it('should return null when nothing has been set', async () => {
      expect(service.getDoYouWantToDownloadTrainAndQualsAnswer()).toEqual(null);
    });

    it('should be set when getDoYouWantToDownloadTrainAndQualsAnswer is called', async () => {
      service.setDoYouWantToDownloadTrainAndQualsAnswer('Yes');

      expect(service.getDoYouWantToDownloadTrainAndQualsAnswer()).toEqual('Yes');
    });

    it('should clear when clearDoYouWantToDownloadTrainAndQualsAnswer is called', async () => {
      service.setDoYouWantToDownloadTrainAndQualsAnswer('Yes');
      service.clearDoYouWantToDownloadTrainAndQualsAnswer();

      expect(service.getDoYouWantToDownloadTrainAndQualsAnswer()).toEqual(null);
    });
  });

  describe('getAllWorkersGroupedByJobRole', () => {
    const mockEstablishmentUid = 'mock-uid';
    const expectedEndpoint = `/api/establishment/${mockEstablishmentUid}/worker/groupedByJobRole`;

    it('should call the expected endpoint', () => {
      service.getAllWorkersGroupedByJobRole(mockEstablishmentUid).subscribe();

      const req = http.expectOne(expectedEndpoint);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('workersGroupedByJobRole', () => {
    it('should return null when nothing has been set', () => {
      expect(service.getWorkersGroupedByJobRole()).toEqual(null);
    });

    it('should be set when setWorkersGroupedByJobRole is called', () => {
      const workers = {
        'groups': [
          {
            'jobId': 2,
            'title': 'Administrative',
            'workers': [
              {
                'uid': '25efe005-eca0-4db8-81fa-cfe0a6849c7d',
                'mainJob': {
                  'id': 2,
                  'title': 'Administrative',
                }
              }
            ],
            'count': 1,
          },
        ],
      }
      service.setWorkersGroupedByJobRole(workers);

      expect(service.getWorkersGroupedByJobRole()).toEqual(workers);
    });
  });
});
