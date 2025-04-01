import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  UpdateWorkplaceAfterStaffChangesService,
  WorkplaceUpdateFlowType,
} from '@core/services/update-workplace-after-staff-changes.service';

@Component({
  selector: 'app-update-workplace-details-after-staff-changes',
  templateUrl: './update-workplace-details-after-staff-changes.component.html',
})
export class UpdateWorkplaceDetailsAfterStaffChangesComponent {
  constructor(
    private establishmentService: EstablishmentService,
    private router: Router,
    private backLinkService: BackLinkService,
    private updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {}

  public workplace: Establishment;
  public allPagesVisited: boolean;
  public WorkplaceUpdateFlowType = WorkplaceUpdateFlowType;
  public flowType: WorkplaceUpdateFlowType;

  ngOnInit(): void {
    this.flowType = this.route.snapshot?.data?.flowType;
    this.workplace = this.establishmentService.establishment;
    this.allPagesVisited = this.updateWorkplaceAfterStaffChangesService.allUpdatePagesVisited(this.flowType);
    this.updateWorkplaceAfterStaffChangesService.clearAllSelectedJobRoles();
    this.backLinkService.showBackLink();

    if (this.allPagesVisited) {
      this.alertService.addAlert({
        type: 'success',
        message: `Total number of staff, vacancies and ${
          this.flowType === WorkplaceUpdateFlowType.ADD ? 'starters' : 'leavers'
        } information saved`,
      });
    }
  }

  public isArray(variable: any): boolean {
    return Array.isArray(variable);
  }

  public clickContinue(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }
}
