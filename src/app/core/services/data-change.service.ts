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
    let params = new HttpParams();

    params = params.set('limit', '1');
    params = params.set('fields', 'content,title,last_updated');

    return this.http.get<DataChange>(`${environment.cmsUri}/items/${this.path}`, { params });
  }

  public updateBUDataChangeLastUpdated(establishmentId: string, lastUpdated: Date) {
    return this.http.post<any>(`/api/establishment/${establishmentId}/bulkUpload/dataChange`, { lastUpdated });
  }
}
