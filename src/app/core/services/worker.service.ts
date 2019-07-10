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
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Worker, WorkerEditResponse, WorkersResponse } from '../model/worker.model';
import { EstablishmentService } from './establishment.service';

export interface Reason {
  id: number;
  reason: string;
}

interface LeaveReasonsResponse {
  reasons: Array<Reason>;
}

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private _worker$ = new BehaviorSubject<Worker>(null);
  public worker$ = this._worker$.asObservable();
  private lastDeleted$ = new BehaviorSubject<string>(null);
  private returnTo$ = new BehaviorSubject<URLStructure>(null);
  private totalStaffReturn$ = new BehaviorSubject<boolean>(false);
  private _alert$: BehaviorSubject<Alert> = new BehaviorSubject<Alert>(null);
  public alert$: Observable<Alert> = this._alert$.asObservable();

  public createStaffResponse = null;

  // All workers store
  private _workers$: BehaviorSubject<Worker> = new BehaviorSubject<Worker>(null);
  public workers$: Observable<Worker> = this._workers$.asObservable();

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  public get worker() {
    return this._worker$.value as Worker;
  }

  public get lastDeleted() {
    return this.lastDeleted$.value as string;
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
    return worker.mainJob.jobId === id || (worker.otherJobs && worker.otherJobs.some(j => j.jobId === id));
  }

  setLastDeleted(name: string) {
    this.lastDeleted$.next(name);
  }

  clearLastDeleted() {
    this.lastDeleted$.next(null);
  }

  setState(worker) {
    this._worker$.next(worker);
  }

  setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }

  setTotalStaffReturn(val) {
    this.totalStaffReturn$.next(val);
  }

  getWorker(workerId: string): Observable<Worker> {
    return this.http.get<Worker>(`/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`);
  }

  public getAllWorkersByUid(establishmentUid: string): Observable<Worker[]> {
    return this.http.get<WorkersResponse>(`/api/establishment/${establishmentUid}/worker`).pipe(map(w => w.workers));
  }

  public getAllWorkers(): Observable<Worker[]> {
    return this.http
      .get<WorkersResponse>(`/api/establishment/${this.establishmentService.establishmentId}/worker`)
      .pipe(map(w => w.workers));
  }

  getLeaveReasons() {
    return this.http.get<LeaveReasonsResponse>('/api/worker/leaveReasons').pipe(map(r => r.reasons));
  }

  createWorker(props) {
    return this.http.post<WorkerEditResponse>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker`,
      props
    );
  }

  updateWorker(workerId: string, props) {
    return this.http.put<WorkerEditResponse>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`,
      props
    );
  }

  deleteWorker(workerId: string, reason?: any) {
    return this.http.request<any>(
      'delete',
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`,
      {
        ...(reason && {
          body: reason,
        }),
      }
    );
  }

  getAvailableQualifcations(workerId: string, type: QualificationType) {
    const params = new HttpParams().append('type', type);

    return this.http
      .get<AvailableQualificationsResponse>(
        `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}/qualification/available`,
        {
          params,
        }
      )
      .pipe(map(res => res.qualifications));
  }

  createQualification(workerId: string, record: QualificationRequest) {
    return this.http.post<QualificationRequest>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}/qualification`,
      record
    );
  }

  updateQualification(workerId: string, qualificationId: string, record) {
    return this.http.put(
      `/api/establishment/${
        this.establishmentService.establishmentId
      }/worker/${workerId}/qualification/${qualificationId}`,
      record
    );
  }

  deleteQualification(workerId: string, qualificationId: string) {
    return this.http.delete(
      `/api/establishment/${
        this.establishmentService.establishmentId
      }/worker/${workerId}/qualification/${qualificationId}`
    );
  }

  getQualifications(workerId: string) {
    return this.http.get<QualificationsResponse>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}/qualification`
    );
  }

  getQualification(workerId: string, qualificationId: string) {
    return this.http.get<QualificationResponse>(
      `/api/establishment/${
        this.establishmentService.establishmentId
      }/worker/${workerId}/qualification/${qualificationId}`
    );
  }

  createTrainingRecord(workerId: string, record: TrainingRecordRequest) {
    return this.http.post<TrainingRecordRequest>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}/training`,
      record
    );
  }

  updateTrainingRecord(workerId: string, trainingRecordId: string, record: TrainingRecordRequest) {
    return this.http.put<TrainingRecordRequest>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}/training/${trainingRecordId}`,
      record
    );
  }

  deleteTrainingRecord(workerId: string, trainingRecordId: string) {
    return this.http.delete(
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}/training/${trainingRecordId}`
    );
  }

  getTrainingRecords(workerId: string) {
    return this.http.get<TrainingResponse>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}/training`
    );
  }

  getTrainingRecord(workerId: string, trainingRecordId: string) {
    return this.http.get<any>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}/training/${trainingRecordId}`
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
    request: LocalIdentifiersRequest
  ): Observable<LocalIdentifiersResponse> {
    return this.http.put<LocalIdentifiersResponse>(
      `/api/establishment/${establishmentUid}/worker/localIdentifier`,
      request
    );
  }
}
