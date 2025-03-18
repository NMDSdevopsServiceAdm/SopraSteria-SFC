import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UpdateWorkplaceService } from '@core/services/update-workplace.service';

@Component({
  selector: 'app-update-workplace-details-after-staff-changes',
  templateUrl: './update-workplace-details-after-staff-changes.component.html',
})
export class UpdateWorkplaceDetailsAfterStaffChangesComponent {
  constructor(
    private establishmentService: EstablishmentService,
    private router: Router,
    private backLinkService: BackLinkService,
    private updateWorkplaceService: UpdateWorkplaceService,
  ) {}

  public workplace: Establishment;
  public allPagesVisited: boolean;

  ngOnInit(): void {
    this.workplace = this.establishmentService.establishment;
    this.allPagesVisited = this.updateWorkplaceService.allUpdatePagesVisitedForAdd();
    this.backLinkService.showBackLink();
  }

  public isArray(variable: any): boolean {
    return Array.isArray(variable);
  }

  public clickContinue(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }
}
