import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Worker } from '../model/worker.model';
import { EstablishmentService } from './establishment.service';

interface WorkersResponse {
  workers: Array<Worker>;
}

export interface Reason {
  id: number;
  reason: string;
}

interface LeaveReasonsResponse {
  reasons: Array<Reason>;
}

export interface WorkerEditResponse {
  uid: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private _worker$ = new BehaviorSubject<Worker>(null);
  public worker$ = this._worker$.asObservable();
  private lastDeleted$ = new BehaviorSubject<string>(null);
  private returnToSummary$ = new BehaviorSubject<boolean>(false);
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

  public get returnToSummary() {
    return this.returnToSummary$.value as boolean;
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

  setReturnToSummary(val) {
    this.returnToSummary$.next(val);
  }

  getWorker(workerId: string): Observable<Worker> {
    return this.http.get<Worker>(`/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`);
  }

  getAllWorkers() {
    return this.http
      .get<WorkersResponse>(`/api/establishment/${this.establishmentService.establishmentId}/worker`)
      .pipe(map(w => w.workers));
  }

  getLeaveReasons() {
    return this.http.get<LeaveReasonsResponse>('/api/worker/leaveReasons').pipe(map(r => r.reasons));
  }

  createWorker(worker: Worker) {
    return this.http.post<WorkerEditResponse>(
      `/api/establishment/${this.establishmentService.establishmentId}/worker`,
      worker
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

  setCreateStaffResponse(success: number) {
    this.createStaffResponse = success;
  }

  getCreateStaffResponse() {
    const temp = this.createStaffResponse;
    this.createStaffResponse = null;
    return temp;
  }
}
