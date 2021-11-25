import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Wizard } from '@core/model/wizard.model';
import { WizardService } from '@core/services/wizard.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class WizardResolver implements Resolve<any> {
  constructor(private wizardService: WizardService) {}

  resolve(): Observable<null | Wizard[]> {
    return this.wizardService.getWizardPage().pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
