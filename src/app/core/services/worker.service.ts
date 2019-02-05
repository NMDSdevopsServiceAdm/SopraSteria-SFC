import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable, empty } from 'rxjs';
import { catchError, debounceTime, map, tap } from "rxjs/operators"

import { HttpErrorHandler } from "./http-error-handler.service"
import { EstablishmentService } from "./establishment.service"
import { Worker } from "../model/worker.model"

@Injectable({
  providedIn: "root"
})
export class WorkerService {

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler,
    private establishmentService: EstablishmentService
  ) {}

  private worker: Worker
  private _worker$ = new BehaviorSubject<Worker>(null)
  private worker$ = this._worker$.asObservable()

  setWorker(worker: Worker): Observable<WorkerEditResponse> {
    if (worker === null) {
      this._worker$.next(null)
      return empty()

    } else {
      const observable$ = worker.uid ?
        this.updateWorker(worker) : this.createWorker(worker)
      return observable$.pipe(
        tap(() => this._worker$.next(worker))
      )
    }
  }

  /*
   * GET /api/establishment/:establishmentId/worker/:workerId
   */
  getWorker(workerId: string, lazy=true): Observable<Worker> {
    if (lazy && this._worker$.getValue() && this._worker$.getValue().uid === workerId) {
      return this.worker$

    } else {
      return this.http.get<Worker>(`/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`, EstablishmentService.getOptions())
        .pipe(
          debounceTime(500),
          catchError(this.httpErrorHandler.handleHttpError)
        )
    }
  }

  /*
   * GET /api/establishment/:establishmentId/worker
   */
  getAllWorkers() {
    return this.http.get<WorkersResponse>(`/api/establishment/${this.establishmentService.establishmentId}/worker`, EstablishmentService.getOptions())
      .pipe(
        debounceTime(500),
        map(w => w.workers),
        catchError(this.httpErrorHandler.handleHttpError)
      )
  }

  /*
   * POST /api/establishment/:establishmentId/worker
   */
  createWorker(worker: Worker) {
    return this.http.post<WorkerEditResponse>(`/api/establishment/${this.establishmentService.establishmentId}/worker`, worker, EstablishmentService.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      )
  }

  /*
   * PUT /api/establishment/:establishmentId/worker/:workerId
   */
  updateWorker(worker: Worker) {
    return this.http.put<WorkerEditResponse>(`/api/establishment/${this.establishmentService.establishmentId}/worker/${worker.uid}`, worker, EstablishmentService.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      )
  }

  /*
   * DELETE /api/establishment/:establishmentId/worker/:workerId
   */
  deleteWorker(workerId: string) {
    return this.http.delete<any>(`/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`, EstablishmentService.getOptions())
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      )
  }
}

export interface WorkersResponse {
  workers: Array<Worker>
}

export interface WorkerEditResponse {
  uid: string
}
