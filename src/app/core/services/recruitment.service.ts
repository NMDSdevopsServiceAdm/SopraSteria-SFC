import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { catchError, debounceTime, map } from "rxjs/operators"

import { HttpErrorHandler } from "./http-error-handler.service"

@Injectable({
  providedIn: "root"
})
export class RecruitmentService {

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler
  ) {}

  // TODO remove when merged https://github.com/NMDSdevopsServiceAdm/SopraSteria-SFC/pull/181
  private getOptions() {
    let headers = new HttpHeaders()
    headers = headers.append("Content-Type", "application/json")
    return { headers }
  }

  /*
   * GET /api/recruitedFrom
   */
  getRecruitedFrom(): Observable<RecruitmentResponse[]> {
    return this.http.get<any>("/api/recruitedFrom", this.getOptions())
      .pipe(
        debounceTime(500),
        map(res => res.recruitedFrom),
        catchError(this.httpErrorHandler.handleHttpError))
  }
}

export interface RecruitmentResponse {
  id: number,
  from: string
}
