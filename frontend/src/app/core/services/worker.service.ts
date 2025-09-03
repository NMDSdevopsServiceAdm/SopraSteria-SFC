import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Alert } from '@core/model/alert.model';
import { Contracts } from '@core/model/contracts.enum';
import { LocalIdentifiersRequest, LocalIdentifiersResponse } from '@core/model/establishment.model';
import {
  AvailableQualificationsResponse,
  QualificationRequest,
  QualificationResponse,
  QualificationsResponse,
  QualificationType,
} from '@core/model/qualification.model';
import {
  CreateTrainingRecordResponse,
  MultipleTrainingResponse,
  TrainingRecordRequest,
  TrainingResponse,
} from '@core/model/training.model';
import { TrainingAndQualificationRecords } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { MandatoryInfoAndMetadataFields, Worker, WorkerEditResponse, WorkersResponse } from '@core/model/worker.model';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Reason {
  id: number;
  reason: string;
}

interface LeaveReasonsResponse {
  reasons: Array<Reason>;
}

interface TotalStaffRecordsResponse {
  total: number;
}

export interface NewWorkerMandatoryInfo {
  nameOrId: string;
  contract: Contracts;
}

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private _alert$: BehaviorSubject<Alert> = new BehaviorSubject<Alert>(null);
  private _worker$ = new BehaviorSubject<Worker>(null);
  private returnTo$ = new BehaviorSubject<URLStructure>(null);
  private totalStaffReturn$ = new BehaviorSubject<boolean>(false);
  public addStaffRecordInProgress$ = new BehaviorSubject<boolean>(false);
  public alert$: Observable<Alert> = this._alert$.asObservable();
  public worker$ = this._worker$.asObservable();
  public getRoute$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public createStaffResponse = null;
  private _newWorkerMandatoryInfo: NewWorkerMandatoryInfo = null;

  private _workers$: BehaviorSubject<Worker[]> = new BehaviorSubject<Worker[]>(null);
  public workers$: Observable<Worker[]> = this._workers$.asObservable();
  public tabChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public _doYouWantToDownloadTrainAndQualsAnswer = null;

  constructor(private http: HttpClient) {}

  public get worker() {
    return this._worker$.value as Worker;
  }

  public get returnTo(): URLStructure {
    return this.returnTo$.value;
  }

  public get totalStaffReturn() {
    return this.totalStaffReturn$.value as boolean;
  }

  public get alert(): Alert {
    return this._alert$.value as Alert;
  }

  public set alert(alert: Alert) {
    this._alert$.next(alert);
  }

  public setAddStaffRecordInProgress(value: boolean): void {
    this.addStaffRecordInProgress$.next(value);
    localStorage.setItem('addStaffRecordInProgress', value.toString());
  }

  public get addStaffRecordInProgress(): boolean {
    if (this.addStaffRecordInProgress$.value) {
      return this.addStaffRecordInProgress$.value;
    }

    const addStaffRecordInProgress = localStorage.getItem('addStaffRecordInProgress');

    if (addStaffRecordInProgress) {
      this.addStaffRecordInProgress$.next(JSON.parse(addStaffRecordInProgress));
    }

    return this.addStaffRecordInProgress$.value;
  }

  public hasJobRole(worker: Worker, id: number) {
    return worker.mainJob.jobId === id || (worker.otherJobs && worker.otherJobs.jobs.some((j) => j.jobId === id));
  }

  setState(worker) {
    this._worker$.next(worker);
  }

  public setWorkers(workers: Worker[]) {
    this._workers$.next(workers);
  }

  setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }

  setTotalStaffReturn(val) {
    this.totalStaffReturn$.next(val);
  }

  getWorker(workplaceUid: string, workerId: string, wdf: boolean = false): Observable<Worker> {
    const params = wdf ? new HttpParams().set('wdf', `${wdf}`) : null;
    return this.http.get<Worker>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}`,
      { params },
    );
  }

  public getAllWorkers(establishmentuid: string, queryParams?: Params): Observable<WorkersResponse> {
    return this.http
      .get<WorkersResponse>(`${environment.appRunnerEndpoint}/api/establishment/${establishmentuid}/worker`, {
        params: queryParams || {},
      })
      .pipe(map((data) => data));
  }

  public getTotalStaffRecords(establishmentuid: string): Observable<number> {
    return this.http
      .get<TotalStaffRecordsResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${establishmentuid}/worker/total`,
      )
      .pipe(map((response) => response.total));
  }

  getLeaveReasons() {
    return this.http
      .get<LeaveReasonsResponse>(`${environment.appRunnerEndpoint}/api/worker/leaveReasons`)
      .pipe(map((r) => r.reasons));
  }

  createWorker(workplaceUid: string, props) {
    return this.http.post<WorkerEditResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker`,
      props,
    );
  }

  updateWorker(workplaceUid: string, workerId: string, props) {
    return this.http.put<WorkerEditResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}`,
      props,
    );
  }

  deleteWorker(workplaceUid: string, workerId: string, reason?: any) {
    return this.http.request<any>(
      'delete',
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}`,
      {
        ...(reason && {
          body: reason,
        }),
      },
    );
  }

  getAvailableQualifications(workplaceUid: string, workerId: string, type: QualificationType) {
    const params = new HttpParams().append('type', type);

    return this.http
      .get<AvailableQualificationsResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/qualification/available`,
        {
          params,
        },
      )
      .pipe(map((res) => res.qualifications));
  }

  getAllAvailableQualifications(
    workplaceUid: string,
    workerUid: string,
  ): Observable<AvailableQualificationsResponse[]> {
    const allQualificationTypes: QualificationType[] = Object.values(QualificationType);
    const allResponses$ = allQualificationTypes.map((type) => {
      const params = new HttpParams().append('type', type);
      return this.http.get<AvailableQualificationsResponse>(
        `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerUid}/qualification/available`,
        {
          params,
        },
      );
    });

    return forkJoin(allResponses$);
  }

  createQualification(workplaceUid: string, workerId: string, record: QualificationRequest) {
    return this.http.post<QualificationResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/qualification`,
      record,
    );
  }

  updateQualification(workplaceUid: string, workerId: string, qualificationId: string, record) {
    return this.http.put(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/qualification/${qualificationId}`,
      record,
    );
  }

  deleteQualification(workplaceUid: string, workerId: string, qualificationId: string) {
    return this.http.delete(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/qualification/${qualificationId}`,
    );
  }

  getQualifications(workplaceUid: string, workerId: string) {
    return this.http.get<QualificationsResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/qualification`,
    );
  }

  getQualification(workplaceUid: string, workerId: string, qualificationId: string) {
    return this.http.get<QualificationResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/qualification/${qualificationId}`,
    );
  }

  createMultipleTrainingRecords(workplaceUid: string, workerUids: string[], record: TrainingRecordRequest) {
    return this.http.post<MultipleTrainingResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/multiple-training`,
      {
        trainingRecord: record,
        workerUids,
      },
    );
  }

  createTrainingRecord(workplaceUid: string, workerId: string, record: TrainingRecordRequest) {
    return this.http.post<CreateTrainingRecordResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/training`,
      record,
    );
  }

  updateTrainingRecord(
    workplaceUid: string,
    workerId: string,
    trainingRecordId: string,
    record: TrainingRecordRequest,
  ) {
    return this.http.put<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/training/${trainingRecordId}`,
      record,
    );
  }

  deleteTrainingRecord(workplaceUid: string, workerId: string, trainingRecordId: string) {
    return this.http.delete(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/training/${trainingRecordId}`,
    );
  }

  getTrainingRecords(workplaceUid: string, workerId: string) {
    return this.http.get<TrainingResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/training`,
    );
  }

  getAllTrainingAndQualificationRecords(
    workplaceUid: string,
    workerId: string,
  ): Observable<TrainingAndQualificationRecords> {
    return this.http.get<TrainingAndQualificationRecords>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/trainingAndQualifications/getAllTrainingAndQualifications`,
    );
  }

  getTrainingRecord(workplaceUid: string, workerId: string, trainingRecordId: string) {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/training/${trainingRecordId}`,
    );
  }

  workerHasAnyTrainingOrQualifications(workplaceUid: string, workerId: string) {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${workplaceUid}/worker/${workerId}/trainingAndQualifications/workerHasAnyTrainingOrQualifications`,
    );
  }

  setCreateStaffResponse(success: number) {
    this.createStaffResponse = success;
  }

  getCreateStaffResponse() {
    const temp = this.createStaffResponse;
    this.createStaffResponse = null;
    return temp;
  }

  public updateLocalIdentifiers(
    establishmentUid: string,
    request: LocalIdentifiersRequest,
  ): Observable<LocalIdentifiersResponse> {
    return this.http.put<LocalIdentifiersResponse>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentUid}/worker/localIdentifier`,
      request,
    );
  }

  public getLongTermAbsenceReasons(): Observable<Array<string>> {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/longTermAbsence`).pipe(map((res) => res.reasons));
  }

  public setNewWorkerMandatoryInfo(nameOrId: string, contract: Contracts): void {
    this._newWorkerMandatoryInfo = { nameOrId, contract };
  }

  public get newWorkerMandatoryInfo(): NewWorkerMandatoryInfo {
    return this._newWorkerMandatoryInfo;
  }

  public clearNewWorkerMandatoryInfo(): void {
    this._newWorkerMandatoryInfo = null;
  }

  public hasAnsweredNonMandatoryQuestion(): boolean {
    if (!this.worker) {
      return false;
    }

    const nonMandatoryQuestions = Object.entries(this.worker).filter(
      ([fieldName, _answer]) => !MandatoryInfoAndMetadataFields.includes(fieldName),
    );

    return nonMandatoryQuestions.some(([_fieldName, answer]) => answer !== null);
  }

  public setDoYouWantToDownloadTrainAndQualsAnswer(downloadTrainAndQualsAnswer: string) {
    this._doYouWantToDownloadTrainAndQualsAnswer = downloadTrainAndQualsAnswer;
  }

  public getDoYouWantToDownloadTrainAndQualsAnswer(): string {
    return this._doYouWantToDownloadTrainAndQualsAnswer;
  }

  public clearDoYouWantToDownloadTrainAndQualsAnswer(): void {
    this._doYouWantToDownloadTrainAndQualsAnswer = null;
  }
}
