import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Wizard } from '@core/model/wizard.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { EstablishmentService } from './establishment.service';
import { PermissionsService } from './permissions/permissions.service';

@Injectable({
  providedIn: 'root',
})
export class WizardService {
  private path = 'wizard';

  constructor(
    private http: HttpClient,
    private permissionService: PermissionsService,
    private establishmentservice: EstablishmentService,
  ) {}

  public getWizardPage(): Observable<Wizard> {
    let params = new HttpParams();

    const benchmarkFilter = {
      benchmarks_flag: {
        _in: [false, this.permissionService.can(this.establishmentservice.primaryWorkplace.uid, 'canViewBenchmarks')],
      },
    };
    params = params.set('sort', 'order');
    params = params.set('fields', 'content,title,image');
    params = params.set('filter', JSON.stringify(benchmarkFilter));

    return this.http.get<Wizard>(`${environment.cmsUri}${this.path}`, { params });
  }
}
