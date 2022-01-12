import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataChange } from '@core/model/data-change.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataChangeService {
  private path = 'data-change';

  constructor(private http: HttpClient) {}

  public getDataChange(lastupdated): Observable<DataChange> {
    let params = new HttpParams();
    const lastUpdate = {
      last_updated: { _eq: lastupdated },
    };
    params = params.set('filter', JSON.stringify(lastUpdate));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title,last_updated');

    return this.http.get<DataChange>(`${environment.cmsUri}/items/${this.path}`, { params });
  }
}
