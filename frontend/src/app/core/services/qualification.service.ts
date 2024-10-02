import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QualificationLevel, QualificationType } from '@core/model/qualification.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QualificationService {
  protected _selectedQualification: { type: QualificationType; id: number } = null;

  constructor(private http: HttpClient) {}

  getQualifications(): Observable<QualificationLevel[]> {
    return this.http
      .get<any>(`${environment.appRunnerEndpoint}/api/qualification`)
      .pipe(map((res) => res.qualifications));
  }

  public get selectedQualification() {
    return this._selectedQualification;
  }

  public setSelectedQualification(type: QualificationType, id: number) {
    if (type && id) {
      this._selectedQualification = { type, id };
    }
  }

  public clearSelectedQualification() {
    this._selectedQualification = null;
  }
}
