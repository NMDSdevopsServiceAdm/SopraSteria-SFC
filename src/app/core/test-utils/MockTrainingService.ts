import { Injectable } from '@angular/core';
import { TrainingCategory } from '@core/model/training.model';
import { TrainingService } from '@core/services/training.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockTrainingService extends TrainingService {
  public selectedStaff = [];
  public _mockTrainingOrQualificationPreviouslySelected: string = null;

  public get trainingOrQualificationPreviouslySelected() {
    return null;
  }

  public set trainingOrQualificationPreviouslySelected(value: string) {
    this._mockTrainingOrQualificationPreviouslySelected = value;
  }

  getCategories(): Observable<TrainingCategory[]> {
    return of([
      { id: 1, seq: 10, category: 'Activity provision/Well-being' },
      { id: 2, seq: 20, category: 'Autism' },
    ]);
  }
}

@Injectable()
export class MockTrainingServiceWithPreselectedStaff extends MockTrainingService {
  public selectedStaff = ['1234'];
  public get trainingOrQualificationPreviouslySelected() {
    return 'training';
  }
}
