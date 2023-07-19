import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsefulLinksService {
  private pathPay = 'useful_link_pay';
  private pathRecruitment = 'useful_link_recruitment';

  constructor(private http: HttpClient) {}

  public getUsefulLinksForPay(): Observable<any> {
    let params = new HttpParams();

    params = params.set('limit', '1');
    params = params.set('fields', 'content,title');

    return this.http.get<any>(`${environment.cmsUri}/items/${this.pathPay}`, { params });
  }

  public getUsefulLinksForRecruitment(): Observable<any> {
    let params = new HttpParams();

    params = params.set('limit', '1');
    params = params.set('fields', 'content,title');

    return this.http.get<any>(`${environment.cmsUri}/items/${this.pathRecruitment}`, { params });
  }
}
