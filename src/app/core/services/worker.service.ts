import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Alert } from '@core/model/alert.model';
import { LocalIdentifiersRequest, LocalIdentifiersResponse } from '@core/model/establishment.model';
import {
  AvailableQualificationsResponse,
  QualificationRequest,
  QualificationResponse,
  QualificationsResponse,
  QualificationType,
} from '@core/model/qualification.model';
import { TrainingRecordRequest, TrainingResponse } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { Worker, WorkerEditResponse, WorkersResponse } from '@core/model/worker.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  private _workers$: BehaviorSubject<Worker[]> = new BehaviorSubject<Worker[]>(null);
  public workers$: Observable<Worker[]> = this._workers$.asObservable();
  public tabChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

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

  public hasJobRole(worker: Worker, id: number) {
    return worker.mainJob.jobId === id || (worker.otherJobs && worker.otherJobs.jobs.some(j => j.jobId === id));
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
    return this.http.get<Worker>(`/api/establishment/${workplaceUid}/worker/${workerId}`, { params });
  }

  public getAllWorkers(establishmentuid: string): Observable<Worker[]> {
    return this.http.get<WorkersResponse>(`/api/establishment/${establishmentuid}/worker`).pipe(map(w => w.workers));
  }

  public getTotalStaffRecords(establishmentuid: string): Observable<number> {
    return this.http
      .get<TotalStaffRecordsResponse>(`/api/establishment/${establishmentuid}/worker/total`)
      .pipe(map(response => response.total));
  }

  getLeaveReasons() {
    return this.http.get<LeaveReasonsResponse>('/api/worker/leaveReasons').pipe(map(r => r.reasons));
  }

  createWorker(workplaceUid: string, props) {
    return this.http.post<WorkerEditResponse>(`/api/establishment/${workplaceUid}/worker`, props);
  }

  updateWorker(workplaceUid: string, workerId: string, props) {
    return this.http.put<WorkerEditResponse>(`/api/establishment/${workplaceUid}/worker/${workerId}`, props);
  }

  deleteWorker(workplaceUid: string, workerId: string, reason?: any) {
    return this.http.request<any>('delete', `/api/establishment/${workplaceUid}/worker/${workerId}`, {
      ...(reason && {
        body: reason,
      }),
    });
  }

  getAvailableQualifcations(workplaceUid: string, workerId: string, type: QualificationType) {
    const params = new HttpParams().append('type', type);

    return this.http
      .get<AvailableQualificationsResponse>(
        `/api/establishment/${workplaceUid}/worker/${workerId}/qualification/available`,
        {
          params,
        }
      )
      .pipe(map(res => res.qualifications));
  }

  createQualification(workplaceUid: string, workerId: string, record: QualificationRequest) {
    return this.http.post<QualificationRequest>(
      `/api/establishment/${workplaceUid}/worker/${workerId}/qualification`,
      record
    );
  }

  updateQualification(workplaceUid: string, workerId: string, qualificationId: string, record) {
    return this.http.put(
      `/api/establishment/${workplaceUid}/worker/${workerId}/qualification/${qualificationId}`,
      record
    );
  }

  deleteQualification(workplaceUid: string, workerId: string, qualificationId: string) {
    return this.http.delete(`/api/establishment/${workplaceUid}/worker/${workerId}/qualification/${qualificationId}`);
  }

  getQualifications(workplaceUid: string, workerId: string) {
    return this.http.get<QualificationsResponse>(`/api/establishment/${workplaceUid}/worker/${workerId}/qualification`);
  }

  getQualification(workplaceUid: string, workerId: string, qualificationId: string) {
    return this.http.get<QualificationResponse>(
      `/api/establishment/${workplaceUid}/worker/${workerId}/qualification/${qualificationId}`
    );
  }

  createTrainingRecord(workplaceUid: string, workerId: string, record: TrainingRecordRequest) {
    return this.http.post<TrainingRecordRequest>(
      `/api/establishment/${workplaceUid}/worker/${workerId}/training`,
      record
    );
  }

  updateTrainingRecord(
    workplaceUid: string,
    workerId: string,
    trainingRecordId: string,
    record: TrainingRecordRequest
  ) {
    return this.http.put<TrainingRecordRequest>(
      `/api/establishment/${workplaceUid}/worker/${workerId}/training/${trainingRecordId}`,
      record
    );
  }

  deleteTrainingRecord(workplaceUid: string, workerId: string, trainingRecordId: string) {
    return this.http.delete(`/api/establishment/${workplaceUid}/worker/${workerId}/training/${trainingRecordId}`);
  }

  getTrainingRecords(workplaceUid: string, workerId: string) {
    return this.http.get<TrainingResponse>(`/api/establishment/${workplaceUid}/worker/${workerId}/training`);
  }

  getTrainingRecord(workplaceUid: string, workerId: string, trainingRecordId: string) {
    return this.http.get<any>(`/api/establishment/${workplaceUid}/worker/${workerId}/training/${trainingRecordId}`);
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
    request: LocalIdentifiersRequest
  ): Observable<LocalIdentifiersResponse> {
    return this.http.put<LocalIdentifiersResponse>(
      `/api/establishment/${establishmentUid}/worker/localIdentifier`,
      request
    );
  }
}
