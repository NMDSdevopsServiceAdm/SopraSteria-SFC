import { Injectable, isDevMode } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject } from "rxjs"
import { catchError, debounceTime, map } from "rxjs/operators"

import { EstablishmentService } from "./establishment.service"
import { Worker } from "../model/worker.model"

@Injectable({
  providedIn: "root"
})
export class WorkerService {

  constructor(
    private http: HttpClient,
    private establishmentService: EstablishmentService
  ) {}

  /*
   * GET /api/establishment/:establishmentId/worker/:workerId
   */
  getWorker(workerId: string | number) {
    return this.http.get<Worker>(`/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`)
  }

  /*
   * GET /api/establishment/:establishmentId/worker
   */
  getAllWorkers() {
    return this.http.get<WorkersResponse>(`/api/establishment/${this.establishmentService.establishmentId}/worker`).pipe(
      map(w => w.workers)
    )
  }

  /*
   * POST /api/establishment/:establishmentId/worker
   */
  createWorker(data: Worker) {
    return this.http.post<any>(`/api/establishment/${this.establishmentService.establishmentId}/worker`, data)
  }

  // TODO this probably requires amendments before using
  /*
   * PUT /api/establishment/:establishmentId/worker/:workerId
   */
  editWorker(workerId: string | number, data) {
    return this.http.put<any>(`/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`, data)
  }

  // TODO this probably requires amendments before using
  /*
   * DELETE /api/establishment/:establishmentId/worker/:workerId
   */
  deleteWorker(workerId: string | number) {
    return this.http.delete<any>(`/api/establishment/${this.establishmentService.establishmentId}/worker/${workerId}`)
  }
}

interface WorkersResponse {
  workers: Array<Worker>
}
