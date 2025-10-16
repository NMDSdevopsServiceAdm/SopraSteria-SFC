import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetTrainingCoursesResponse, TrainingCourse } from '@core/model/training-course.model';

@Injectable({
  providedIn: 'root',
})
export class TrainingCourseService {
  constructor(private http: HttpClient) {}

  public getTrainingCourses(establishmentUid: string): Observable<Array<TrainingCourse>> {
    return this.http
      .get<GetTrainingCoursesResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse`,
      )
      .pipe(map((res) => res.trainingCourses));
  }

  public getTrainingCoursesByCategory(
    establishmentUid: string,
    trainingCategoryId: number,
  ): Observable<Array<TrainingCourse>> {
    return this.http
      .get<GetTrainingCoursesResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse`,
        {
          params: { trainingCategoryId },
        },
      )
      .pipe(map((res) => res.trainingCourses));
  }

  public createTrainingCourse(establishmentUid: string, props: Partial<TrainingCourse>): Observable<TrainingCourse> {
    return this.http.post<TrainingCourse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse`,
      props,
    );
  }
}
