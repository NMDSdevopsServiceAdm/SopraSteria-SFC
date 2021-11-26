import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Wizard } from '@core/model/wizard.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WizardService {
  private path = 'wizard';

  constructor(private http: HttpClient) {}

  public getWizardPage(): Observable<Wizard> {
    let params = new HttpParams();

    params = params.set('sort', 'order');
    params = params.set('fields', 'content,title,image');

    return this.http.get<Wizard>(`${environment.cmsUri}${this.path}`, { params });
  }
}
