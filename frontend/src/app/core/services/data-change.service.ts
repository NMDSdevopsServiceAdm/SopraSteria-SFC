import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataChange } from '@core/model/data-change.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataChangeService {
  private path = 'data_changes';

  constructor(private http: HttpClient) {}

  public getDataChange(): Observable<DataChange> {
    const params = new HttpParams()
      .set('limit', '1')
      .set('fields', 'content,title,last_updated')
      .set('env', environment.environmentName);

    return this.http.get<DataChange>(`${environment.appRunnerEndpoint}/api/cms/items/${this.path}`, { params });
  }

  public updateBUDataChangeLastUpdated(establishmentId: string, lastUpdated: Date): Observable<DataChange> {
    return this.http.post<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/bulkUpload/dataChange`,
      { lastUpdated },
    );
  }

  public getDataChangesLastUpdate(establishmentId: string): Observable<DataChange> {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/establishment/${establishmentId}/bulkUpload/dataChange`,
    );
  }
}
