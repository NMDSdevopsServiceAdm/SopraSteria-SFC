import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QualificationLevel } from '@core/model/qualification.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QualificationService {
  constructor(private http: HttpClient) {}

  getQualifications(): Observable<QualificationLevel[]> {
    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/qualification`).pipe(map((res) => res.qualifications));
  }
}
