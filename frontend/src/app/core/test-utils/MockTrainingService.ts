import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { allMandatoryTrainingCategories, TrainingCategory } from '@core/model/training.model';
import { MandatoryTrainingService, TrainingService } from '@core/services/training.service';
import { Observable, of } from 'rxjs';

import { AllJobs, JobsWithDuplicates } from '../../../mockdata/jobs';
import { workerBuilder } from './MockWorkerService';

const workers = [workerBuilder(), workerBuilder()];
@Injectable()
export class MockTrainingService extends TrainingService {
  public selectedStaff = [];
  public _mockTrainingOrQualificationPreviouslySelected: string = null;
  public _mockTrainingCategorySelectedForTrainingRecord: any = null;
  private _duplicateJobRoles: boolean = false;

  public get trainingOrQualificationPreviouslySelected() {
    return null;
  }

  public static factory(duplicateJobRoles = false) {
    return (httpClient: HttpClient) => {
      const service = new MockTrainingService(httpClient);
      service._duplicateJobRoles = duplicateJobRoles;
      return service;
    };
  }

  public set trainingOrQualificationPreviouslySelected(value: string) {
    this._mockTrainingOrQualificationPreviouslySelected = value;
  }

  getCategories(): Observable<TrainingCategory[]> {
    return of([
      { id: 1, seq: 10, category: 'Activity provision/Well-being', trainingCategoryGroup: 'Care skills and knowledge' },
      { id: 2, seq: 20, category: 'Autism', trainingCategoryGroup: 'Specific conditions and disabilities' },
      { id: 37, seq: 1, category: 'Other', trainingCategoryGroup: null },
    ]);
  }

  public getAllMandatoryTrainings(): Observable<allMandatoryTrainingCategories> {
    return of(mockMandatoryTraining(this._duplicateJobRoles));
  }

  public deleteCategoryById(establishmentId, categoryId) {
    return of({});
  }

  public deleteAllMandatoryTraining(establishmentId) {
    return of({});
  }
}

@Injectable()
export class MockTrainingServiceWithPreselectedStaff extends MockTrainingService {
  public selectedStaff = workers;
  protected _selectedTraining = {
    accredited: 'Yes',
    trainingCategory: { id: 1, seq: 3, category: 'Category' },
    completed: '2020-01-01',
    expires: '2021-01-01',
    notes: 'This is a note',
    title: 'Title',
    howWasItDelivered: 'Face to face',
    externalProviderName: null,
    deliveredBy: null,
    validityPeriodInMonth: null,
  };

  public get trainingOrQualificationPreviouslySelected() {
    return 'training';
  }

  public static factory(incompleteTraining = false) {
    return (http: HttpClient) => {
      const service = new MockTrainingServiceWithPreselectedStaff(http);
      if (incompleteTraining) {
        service._selectedTraining = { ...service._selectedTraining, completed: null, expires: null, notes: null };
      }
      return service;
    };
  }
}

@Injectable()
export class MockTrainingServiceWithOverrides extends TrainingService {
  public static factory(overrides: any = {}) {
    return (httpClient: HttpClient) => {
      const service = new MockTrainingServiceWithOverrides(httpClient);

      Object.keys(overrides).forEach((overrideName) => {
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}

@Injectable()
export class MockMandatoryTrainingService extends MandatoryTrainingService {
  public static factory(overrides = {}) {
    return (http: HttpClient) => {
      const service = new MockMandatoryTrainingService(http);

      Object.keys(overrides).forEach((overrideName) => {
        service[overrideName] = overrides[overrideName];
      });

      return service;
    };
  }
}

export const mockMandatoryTraining = (duplicateJobRoles = false) => {
  return {
    allJobRolesCount: 37,
    lastUpdated: new Date(),
    mandatoryTraining: [
      {
        trainingCategoryId: 123,
        allJobRoles: false,
        category: 'Autism',
        selectedJobRoles: true,
        jobs: [
          {
            id: 15,
            title: 'Activities worker, coordinator',
          },
        ],
      },
      {
        trainingCategoryId: 9,
        allJobRoles: true,
        category: 'Coshh',
        selectedJobRoles: true,
        jobs: duplicateJobRoles ? JobsWithDuplicates : AllJobs,
      },
    ],
    mandatoryTrainingCount: 2,
  };
};
