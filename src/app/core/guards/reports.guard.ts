import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Injectable({
  providedIn: 'root',
})
export class ReportsGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const workplace = this.establishmentService.primaryWorkplace;
    if (workplace) {
      return (
        this.permissionsService.can(workplace.uid, 'canViewWdfReport') ||
        this.permissionsService.can(workplace.uid, 'canRunLocalAuthorityReport')
      );
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
