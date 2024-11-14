import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Qualification, QualificationLevel, QualificationType } from '@core/model/qualification.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QualificationService {
  protected _selectedQualification: Qualification = null;

  constructor(private http: HttpClient) {}

  getQualifications(): Observable<QualificationLevel[]> {
    return this.http
      .get<any>(`${environment.appRunnerEndpoint}/api/qualification`)
      .pipe(map((res) => res.qualifications));
  }

  public get selectedQualification() {
    return this._selectedQualification;
  }

  public setSelectedQualification(id: number, title: string, group: QualificationType) {
    if (id && title && group) {
      this._selectedQualification = { id, title, group };
    }
  }

  public clearSelectedQualification() {
    this._selectedQualification = null;
  }
}
