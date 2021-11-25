import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Wizard } from '@core/model/wizard.model';
import { WizardService } from '@core/services/wizard.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class WizardResolver implements Resolve<any> {
  constructor(private wizardService: WizardService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<null | Wizard[]> {
    const lastUrlSegmentIndex = route.url.length - 1;
    const slug = route.url[lastUrlSegmentIndex].path;
    if (slug) {
      return this.wizardService.getWizardPage().pipe(
        take(1),
        catchError(() => {
          return of(null);
        }),
      );
    }
  }
}
