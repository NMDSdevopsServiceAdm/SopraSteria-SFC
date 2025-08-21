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
    const params = new HttpParams()
      .set('limit', '1')
      .set('fields', 'content,title')
      .set('env', environment.environmentName);

    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/cms/items/${this.pathPay}`, { params });
  }

  public getUsefulLinksForRecruitment(): Observable<any> {
    const params = new HttpParams()
      .set('limit', '1')
      .set('fields', 'content,title')
      .set('env', environment.environmentName);

    return this.http.get<any>(`${environment.appRunnerEndpoint}/api/cms/items/${this.pathRecruitment}`, { params });
  }
}
