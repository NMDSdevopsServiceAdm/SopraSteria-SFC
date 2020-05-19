import { WorkerService } from '@core/services/worker.service';
import { Worker } from '@core/model/worker.model';
import { Observable, of } from 'rxjs';
import { TrainingResponse } from '@core/model/training.model';

export class MockWorkerService extends WorkerService {
  getAllWorkers(establishmentUid: string): Observable<Worker[]> {
    return of([
      {
        trainingCount: 1
      }
    ] as Worker[]);
  }

  getTrainingRecords(workplaceUid: string, workerId: string): Observable<TrainingResponse> {
    return of({
      lastUpdated: '2020-01-01T00:00:00Z'
    } as TrainingResponse);
  }
}
