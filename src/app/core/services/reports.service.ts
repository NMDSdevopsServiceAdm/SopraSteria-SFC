import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WDFReport } from '@core/model/reports.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { EstablishmentService } from './establishment.service';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private _reportDetails$: BehaviorSubject<WDFReport> = new BehaviorSubject<WDFReport>(null);
  public reportDetails$: Observable<WDFReport> = this._reportDetails$.asObservable();

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  // TODO: use establishmentId parameter
  getWDFReport(establishmentId: number, updatedEffectiveFrom?: string): Observable<WDFReport> {
    let params: HttpParams;

    if (updatedEffectiveFrom) {
      params = new HttpParams().set('effectiveFrom', updatedEffectiveFrom);
    }

    return this.http.get<WDFReport>(`/api/reports/wdf/establishment/${this.establishmentService.establishmentId}`, {
      params,
    });
  }

  updateState(data) {
    this._reportDetails$.next(data);
  }
}
