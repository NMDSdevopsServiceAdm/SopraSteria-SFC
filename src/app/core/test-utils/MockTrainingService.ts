import { Injectable } from '@angular/core';
import { allMandatoryTrainingCategories, TrainingCategory } from '@core/model/training.model';
import { TrainingService } from '@core/services/training.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockTrainingService extends TrainingService {
  public selectedStaff = [];

  getCategories(): Observable<TrainingCategory[]> {
    return of([
      { id: 1, seq: 10, category: 'Activity provision/Well-being' },
      { id: 2, seq: 20, category: 'Autism' },
    ]);
  }

  public getAllMandatoryTrainings(): Observable<allMandatoryTrainingCategories> {
    return of({
      allJobRolesCount: 29,
      lastUpdated: new Date(),
      mandatoryTraining: [
        {
          trainingCategoryId: 123,
          allJobRoles: false,
          selectedJobRoles: true,
          jobs: [
            {
              id: 15,
            },
          ],
        },
      ],
      mandatoryTrainingCount: 2,
    });
  }
}

@Injectable()
export class MockTrainingServiceWithPreselectedStaff extends MockTrainingService {
  public selectedStaff = ['1234'];
}
