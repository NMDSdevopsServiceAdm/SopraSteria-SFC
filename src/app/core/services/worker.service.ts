import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, empty, Observable } from 'rxjs';
import { catchError, debounceTime, map, tap } from 'rxjs/operators';

import { Worker } from '../model/worker.model';
import { EstablishmentService } from './establishment.service';
import { HttpErrorHandler } from './http-error-handler.service';

interface WorkersResponse {
  workers: Array<Worker>;
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

  setWorker(worker: Worker): Observable<WorkerEditResponse> {
    if (worker === null) {
      this._worker$.next(null);
      return empty();
    } else {
      const observable$ = worker.uid ? this.updateWorker(worker) : this.createWorker(worker);
      return observable$.pipe(tap(() => this._worker$.next(worker)));
    }
  }

  updateState(data) {
    if (data.length > 1) {
      this._workers$.next(data);
    } else {
      this._worker$.next(data);
    }
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
  updateWorker(worker: Worker) {
    return this.http
      .put<WorkerEditResponse>(
        `/api/establishment/${this.establishmentService.establishmentId}/worker/${worker.uid}`,
        worker,
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
  deleteWorker(workerId: string) {
    return this.http
      .delete<any>(
        `/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`,
        EstablishmentService.getOptions()
      )
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }
}
