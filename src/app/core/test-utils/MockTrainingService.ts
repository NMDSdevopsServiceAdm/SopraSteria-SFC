import { Injectable } from '@angular/core';
import { TrainingService } from '@core/services/training.service';

@Injectable()
export class MockTrainingService extends TrainingService {
  public selectedStaff = [];
}

export class MockTrainingServiceWithPreselectedStaff extends MockTrainingService {
  public selectedStaff = ['1234'];
}
