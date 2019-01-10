import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"

import { HttpErrorHandler } from "./http-error-handler.service"
import { EstablishmentService } from "./establishment.service"

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(
    private http: HttpClient,
    private establishmentService: EstablishmentService
  ) {}

  /*
   * POST /api/establishment/:establishmentId/worker
   */
  createWorker(data) {
    return this.http.put<any>(`/api/establishment/${this.establishmentService.establishmentId}/worker`, data)
  }
}
