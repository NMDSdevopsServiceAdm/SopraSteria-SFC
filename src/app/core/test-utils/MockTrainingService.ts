import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { allMandatoryTrainingCategories, TrainingCategory } from '@core/model/training.model';
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

  public getAllMandatoryTrainings(): Observable<allMandatoryTrainingCategories> {
    return of({
      allJobRolesCount: 29,
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
          allJobRoles: false,
          category: 'Coshh',
          selectedJobRoles: true,
          jobs: [
            {
              id: 21,
              title: 'Other (not directly involved in providing care)',
            },
            {
              id: 20,
              title: 'Other (directly involved in providing care)',
            },
            {
              id: 29,
              title: 'Technician',
            },
            {
              id: 28,
              title: 'Supervisor',
            },
            {
              id: 27,
              title: 'Social worker',
            },
            {
              id: 26,
              title: 'Senior management',
            },
            {
              id: 25,
              title: 'Senior care worker',
            },
            {
              id: 24,
              title: 'Safeguarding and reviewing officer',
            },
            {
              id: 23,
              title: 'Registered Nurse',
            },
            {
              id: 22,
              title: 'Registered Manager',
            },
            {
              id: 19,
              title: 'Occupational therapist assistant',
            },
            {
              id: 18,
              title: 'Occupational therapist',
            },
            {
              id: 17,
              title: 'Nursing associate',
            },
            {
              id: 16,
              title: 'Nursing assistant',
            },
            {
              id: 15,
              title: 'Middle management',
            },
            {
              id: 14,
              title: 'Managers and staff (care-related, but not care-providing)',
            },
            {
              id: 13,
              title: 'First-line manager',
            },
            {
              id: 12,
              title: 'Employment support',
            },
            {
              id: 11,
              title: 'Community, support and outreach work',
            },
            {
              id: 10,
              title: 'Care worker',
            },
            {
              id: 9,
              title: 'Care navigator',
            },
            {
              id: 8,
              title: 'Care coordinator',
            },
            {
              id: 7,
              title: 'Assessment officer',
            },
            {
              id: 6,
              title: `Any children's, young people's job role`,
            },
            {
              id: 5,
              title: 'Ancillary staff (non care-providing)',
            },
            {
              id: 4,
              title: 'Allied health professional (not occupational therapist)',
            },
            {
              id: 3,
              title: 'Advice, guidance and advocacy',
            },
            {
              id: 2,
              title: 'Administrative, office staff (non care-providing)',
            },
            {
              id: 1,
              title: 'Activities worker, coordinator',
            },
          ],
        },
      ],
      mandatoryTrainingCount: 2,
    });
  }

  public deleteCategoryById(establishmentId, categoryId) {
    return of({});
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
