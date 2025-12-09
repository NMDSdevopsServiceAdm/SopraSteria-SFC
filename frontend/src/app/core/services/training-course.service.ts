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
  private _newTrainingCourseToBeAdded: Partial<TrainingCourse>;
  private _trainingCourseToBeUpdated: Partial<TrainingCourse>;
  constructor(private http: HttpClient) {}

  public getAllTrainingCourses(establishmentUid: string): Observable<Array<TrainingCourse>> {
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

  public deleteTrainingCourse(establishmentUid: string, trainingCourseUid: string) {
    return this.http.delete(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse/${trainingCourseUid}`,
    );
  }

  public createTrainingCourse(establishmentUid: string, props: Partial<TrainingCourse>): Observable<TrainingCourse> {
    return this.http.post<TrainingCourse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse`,
      props,
    );
  }

  public updateTrainingCourse(
    establishmentUid: string,
    trainingCourseUid: string,
    updates: Partial<TrainingCourse>,
    applyToExistingRecords: boolean,
  ): Observable<TrainingCourse> {
    const requestBody = {
      trainingCourse: updates,
      applyToExistingRecords,
    };

    return this.http.put<TrainingCourse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse/${trainingCourseUid}`,
      requestBody,
    );
  }

  public get newTrainingCourseToBeAdded(): Partial<TrainingCourse> {
    return this._newTrainingCourseToBeAdded;
  }

  public set newTrainingCourseToBeAdded(props: Partial<TrainingCourse>) {
    this._newTrainingCourseToBeAdded = props;
  }

  public get trainingCourseToBeUpdated(): Partial<TrainingCourse> {
    return this._trainingCourseToBeUpdated;
  }

  public set trainingCourseToBeUpdated(props: Partial<TrainingCourse>) {
    this._trainingCourseToBeUpdated = props;
  }
}
