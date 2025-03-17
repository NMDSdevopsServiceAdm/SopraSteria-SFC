import { Component } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-update-workplace-details-after-staff-changes',
  templateUrl: './update-workplace-details-after-staff-changes.component.html',
})
export class UpdateWorkplaceDetailsAfterStaffChangesComponent {
  constructor(private establishmentService: EstablishmentService) {}

  public workplace: Establishment;

  ngOnInit(): void {
    this.workplace = this.establishmentService.establishment;
  }

  public isArray(variable: any): boolean {
    return Array.isArray(variable);
  }
}
