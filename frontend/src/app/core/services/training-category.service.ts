import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import {
  TrainingCategory,
  TrainingCategoryResponse,
  TrainingCategorySortedByGroup,
  TrainingRecordCategories,
} from '@core/model/training.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrainingCategoryService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<TrainingCategory[]> {
    return this.http
      .get<TrainingCategoryResponse>(`${environment.appRunnerEndpoint}/api/trainingCategories`)
      .pipe(map((res) => res.trainingCategories));
  }

  getCategoriesWithTraining(establishmentId): Observable<TrainingRecordCategories[]> {
    return this.http
      .get<any>(`${environment.appRunnerEndpoint}/api/trainingCategories/${establishmentId}/with-training`)
      .pipe(map((res) => res.trainingCategories));
  }

  getTrainingCategory(establishmentUid: string, trainingCategoryId: number, queryParams?: Params): Observable<any> {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/trainingCategories/${establishmentUid}/${trainingCategoryId}`,
      {
        params: queryParams,
      },
    );
  }

  public static summaryText = {
    'Care skills and knowledge': "'duty of care', 'safeguarding adults'",
    'Health and safety in the workplace': "'fire safety', 'first aid'",
    'IT, digital and data in the workplace': "'online safety and security', 'working with digital technology'",
    'Specific conditions and disabilities': "'dementia care', 'Oliver McGowan Mandatory Training'",
    'Staff development': "'communication', 'leadership and management' ",
  };

  public static sortTrainingCategoryByGroups(trainingCategories: TrainingCategory[]): TrainingCategorySortedByGroup {
    const groupTitles = Object.keys(TrainingCategoryService.summaryText);

    return groupTitles.map((groupTitle) => {
      const currentTrainingGroup = {
        title: groupTitle,
        descriptionText: `Training like ${TrainingCategoryService.summaryText[groupTitle]}`,
        items: [],
      };

      const categoryArray = trainingCategories
        .filter((category) => category.trainingCategoryGroup === groupTitle)
        .map((category) => {
          return {
            label: category.category,
            id: category.id,
            seq: category.seq,
          };
        });

      currentTrainingGroup.items = categoryArray;
      return currentTrainingGroup;
    });
  }
}
