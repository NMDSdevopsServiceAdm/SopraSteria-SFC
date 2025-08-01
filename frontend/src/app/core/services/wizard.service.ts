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

  public getWizardPage(canViewBenchmarks: boolean): Observable<Wizard> {
    const benchmarkFilter = {
      benchmarks_flag: {
        _in: [false, canViewBenchmarks],
      },
    };

    const params = new HttpParams()
      .set('sort', 'order')
      .set('fields', 'content,title,image,video')
      .set('_filter', JSON.stringify(benchmarkFilter))
      .set('env', environment.environmentName);

    return this.http.get<Wizard>(`${environment.appRunnerEndpoint}/api/cms/items/${this.path}`, { params });
  }
}
