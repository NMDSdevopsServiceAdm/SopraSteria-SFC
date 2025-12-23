import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GetTrainingCoursesResponse,
  GetTrainingCoursesWithLinkableRecordsResponse,
  TrainingCourse,
  TrainingCourseWithLinkableRecords,
} from '@core/model/training-course.model';
import { TrainingRecord } from '@core/model/training.model';

const revealText = {
  title: 'Why is it a good idea to update records with training course details?',
  paragraph:
    "It's a good idea because your training records will then be consistent with each other, sharing the same details, like course name and validity. We match records to courses by category and when you update them they'll:",
  bullets: [
    'take the name of the training course',
    'say whether the training is accredited',
    'say how the training was delivered and who delivered it',
    'show how long the training is valid for',
    'still generate alerts when the training is due to expire',
    'keep any certificates and notes that were added',
  ],
};

@Injectable({
  providedIn: 'root',
})
export class TrainingCourseService {
  private _newTrainingCourseToBeAdded: Partial<TrainingCourse>;
  private _trainingCourseToBeUpdated: Partial<TrainingCourse>;
  private _trainingRecordsSelectedForUpdate: Array<Pick<TrainingRecord, 'title' | 'uid'>>;

  public static RevealText = revealText;

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

  public deleteAllTrainingCourses(establishmentUid: string) {
    return this.http.delete(`${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse`);
  }

  public getTrainingCoursesWithLinkableRecords(
    establishmentUid: string,
  ): Observable<Array<TrainingCourseWithLinkableRecords>> {
    return this.http
      .get<GetTrainingCoursesWithLinkableRecordsResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse/getTrainingCoursesWithLinkableRecords`,
      )
      .pipe(map((res) => res.trainingCourses));
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

  public updateTrainingRecordsWithCourseDetails(
    establishmentUid: string,
    trainingCourseUid: string,
    trainingRecordsToUpdate: Array<Pick<TrainingRecord, 'uid'>>,
  ): Observable<Array<TrainingRecord>> {
    const requestBody = {
      trainingRecords: trainingRecordsToUpdate,
    };

    return this.http.post<Array<TrainingRecord>>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/trainingCourse/${trainingCourseUid}/updateTrainingRecordsWithCourseDetails`,
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

  public get trainingRecordsSelectedForUpdate() {
    return this._trainingRecordsSelectedForUpdate;
  }

  public set trainingRecordsSelectedForUpdate(props) {
    this._trainingRecordsSelectedForUpdate = props;
  }
}
