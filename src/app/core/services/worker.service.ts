import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';

import { Worker } from '../model/worker.model';
import { EstablishmentService } from './establishment.service';
import { HttpErrorHandler } from './http-error-handler.service';

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
  public createStaffResponse = null;

  // All workers store
  private _workers$: BehaviorSubject<Worker> = new BehaviorSubject<Worker>(null);
  public workers$: Observable<Worker> = this._workers$.asObservable();

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler,
    private establishmentService: EstablishmentService
  ) {}

  public get worker() {
    return this._worker$.value as Worker;
  }

  public get lastDeleted() {
    return this.lastDeleted$.value as string;
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

  /*
   * GET /api/establishment/:establishmentId/worker/:workerId
   */
  getWorker(workerId: string): Observable<Worker> {
    return this.http
      .get<Worker>(
        `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`,
        EstablishmentService.getOptions()
      )
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  /*
   * GET /api/establishment/:establishmentId/worker
   */
  getAllWorkers() {
    return this.http
      .get<WorkersResponse>(
        `/api/establishment/${this.establishmentService.establishmentId}/worker`,
        EstablishmentService.getOptions()
      )
      .pipe(
        debounceTime(500),
        map(w => w.workers),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  getLeaveReasons() {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' });

    return this.http.get<LeaveReasonsResponse>('/api/worker/leaveReasons', { headers }).pipe(
      debounceTime(500),
      map(r => r.reasons),
      catchError(this.httpErrorHandler.handleHttpError)
    );
  }

  /*
   * POST /api/establishment/:establishmentId/worker
   */
  createWorker(worker: Worker) {
    return this.http
      .post<WorkerEditResponse>(
        `/api/establishment/${this.establishmentService.establishmentId}/worker`,
        worker,
        EstablishmentService.getOptions()
      )
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  /*
   * PUT /api/establishment/:establishmentId/worker/:workerId
   */
  updateWorker(workerId: string, props) {
    return this.http
      .put<WorkerEditResponse>(
        `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`,
        props,
        EstablishmentService.getOptions()
      )
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  /*
   * DELETE /api/establishment/:establishmentId/worker/:workerId
   */
  deleteWorker(workerId: string, reason: any) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' });

    return this.http
      .request<any>('delete', `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`, {
        body: reason,
        headers,
      })
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  setCreateStaffResponse(success: number, failed: number) {
    this.createStaffResponse = {
      success,
      failed,
    };
  }

  getCreateStaffResponse() {
    const temp = this.createStaffResponse;
    this.createStaffResponse = null;
    return temp;
  }
}
