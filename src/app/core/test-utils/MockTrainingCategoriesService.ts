import { Injectable } from '@angular/core';
import { TrainingRecordCategories } from '@core/model/training.model';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockTrainingCategoryService extends TrainingCategoryService {
  getCategoriesWithTraining(establishmentId): Observable<TrainingRecordCategories[]> {
    return of([
      {
        id: 2,
        seq: 20,
        category: 'Autism',
        training: [
          {
            id: 14387,
            uid: '9ee484af-1f86-415c-a5f2-26ef1cdf2d1e',
            title: 'Autism',
            expires: new Date('4-12-2022'),
            worker: {
              id: 11561,
              uid: '16117998-fffc-4ff4-9ee1-aecc1cd0be8b',
              NameOrIdValue: 'Matt',
              mainJob: {
                id: 13,
                title: 'First-line manager',
              },
            },
          },
          {
            id: 14393,
            uid: '82f3feb5-9c40-4d8b-8655-787fd227101c',
            title: 'autism training',
            expires: new Date(),
            worker: {
              id: 11578,
              uid: 'f81623be-eae3-44aa-8a1c-1d93c58abd21',
              NameOrIdValue: 'Test 3',
              mainJob: {
                id: 13,
                title: 'manager',
              },
            },
          },
        ],
        isMandatory: false,
      },
    ]);
  }
}
