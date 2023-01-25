import { Injectable } from '@angular/core';
import { TrainingRecordCategories } from '@core/model/training.model';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockTrainingCategoryService extends TrainingCategoryService {
  getCategoriesWithTraining(establishmentId): Observable<TrainingRecordCategories[]> {
    const expiredDate = new Date();
    const expiringDate = new Date();
    const okDate = new Date();

    expiredDate.setDate(expiredDate.getDate() - 3);
    expiringDate.setDate(expiringDate.getDate() + 25);
    okDate.setMonth(okDate.getMonth() + 5);

    return of([
      {
        id: 2,
        seq: 20,
        category: 'Autism',
        training: [
          {
            //  expired
            id: 14387,
            uid: '9ee484af-1f86-415c-a5f2-26ef1cdf2d1e',
            title: 'Autism',
            expires: expiredDate,
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
            // expiring
            id: 14393,
            uid: '82f3feb5-9c40-4d8b-8655-787fd227101c',
            title: 'autism training',
            expires: expiringDate,
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
          {
            // ok
            id: 14395,
            uid: '22f3feb5-9c40-4d8b-8655-787fd227101c',
            title: 'autism 2',
            expires: okDate,
            worker: {
              id: 11582,
              uid: 'a81623be-eae3-44aa-8a1c-1d93c58abd21',
              NameOrIdValue: 'Test 5',
              mainJob: {
                id: 13,
                title: 'manager',
              },
            },
          },
          {
            // missing
            id: 14476,
            missing: true,
            worker: {
              id: 11582,
              uid: 'a81623be-eae3-44aa-8a1c-1d93c58abd21',
              NameOrIdValue: 'Test 5',
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
