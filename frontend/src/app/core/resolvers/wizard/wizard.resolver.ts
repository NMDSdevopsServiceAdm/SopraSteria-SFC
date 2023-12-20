import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Wizard } from '@core/model/wizard.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WizardService } from '@core/services/wizard.service';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class WizardResolver implements Resolve<any> {
  constructor(
    private wizardService: WizardService,
    private permissionService: PermissionsService,
    private establishmentService: EstablishmentService,
  ) {}

  resolve(): Observable<null | Wizard[]> {
    const canViewBenchmarks = this.permissionService.can(
      this.establishmentService.primaryWorkplace.uid,
      'canViewBenchmarks',
    );

    return this.wizardService.getWizardPage(canViewBenchmarks).pipe(
      take(1),
      catchError(() => {
        return of(null);
      }),
    );
  }
}
