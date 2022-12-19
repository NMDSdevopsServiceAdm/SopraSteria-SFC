import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TrainingCategory } from '@core/model/training.model';
import { TrainingService } from '@core/services/training.service';
import { Observable, of } from 'rxjs';

import { workerBuilder } from './MockWorkerService';

const workers = [workerBuilder(), workerBuilder()];
@Injectable()
export class MockTrainingService extends TrainingService {
  public selectedStaff = [];
  public selectedTraining = null;
  getCategories(): Observable<TrainingCategory[]> {
    return of([
      { id: 1, seq: 10, category: 'Activity provision/Well-being' },
      { id: 2, seq: 20, category: 'Autism' },
    ]);
  }
}

@Injectable()
export class MockTrainingServiceWithPreselectedStaff extends MockTrainingService {
  public selectedStaff = workers;
  public selectedTraining = {
    accredited: 'Yes',
    trainingCategory: { id: 1, seq: 3, category: 'Category' },
    completed: '2020-01-01',
    expires: '2021-01-01',
    notes: 'This is a note',
    title: 'Title',
  };

  public static factory(incompleteTraining = false) {
    return (http: HttpClient) => {
      const service = new MockTrainingServiceWithPreselectedStaff(http);
      if (incompleteTraining) {
        service.selectedTraining = { ...service.selectedTraining, completed: null, expires: null, notes: null };
      }
      return service;
    };
  }
}
