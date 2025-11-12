import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService, WorkplaceUpdateFlowType } from '@core/services/vacancies-and-turnover.service';

@Component({
    selector: 'app-update-workplace-details-after-staff-changes',
    templateUrl: './update-workplace-details-after-staff-changes.component.html',
    standalone: false
})
export class UpdateWorkplaceDetailsAfterStaffChangesComponent implements OnInit {
  constructor(
    private establishmentService: EstablishmentService,
    private router: Router,
    private backLinkService: BackLinkService,
    private vacanciesAndTurnoverService: VacanciesAndTurnoverService,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {}

  public workplace: Establishment;
  public allPagesVisited: boolean;
  public allPagesSubmitted: boolean;
  public WorkplaceUpdateFlowType = WorkplaceUpdateFlowType;
  public flowType: WorkplaceUpdateFlowType;
  private totalNumberOfStaff: number;

  ngOnInit(): void {
    this.flowType = this.route.snapshot?.data?.flowType;
    this.totalNumberOfStaff = this.route.snapshot?.data?.totalNumberOfStaff;
    this.workplace = this.establishmentService.establishment;
    this.allPagesVisited = this.vacanciesAndTurnoverService.allUpdatePagesVisited(this.flowType);
    this.allPagesSubmitted = this.vacanciesAndTurnoverService.allUpdatePagesSubmitted(this.flowType);

    this.vacanciesAndTurnoverService.clearAllSelectedJobRoles();
    this.showBackLink();

    if (this.allPagesSubmitted && !this.vacanciesAndTurnoverService.hasViewedSavedBanner) {
      this.alertService.addAlert({
        type: 'success',
        message: `Total number of staff, vacancies and ${
          this.flowType === WorkplaceUpdateFlowType.ADD ? 'starters' : 'leavers'
        } information saved`,
      });

      this.vacanciesAndTurnoverService.hasViewedSavedBanner = true;
    }
  }

  public isArray(variable: unknown): boolean {
    return Array.isArray(variable);
  }

  public clickContinue(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }

  private showBackLink(): void {
    if (this.totalNumberOfStaff > 0) {
      this.backLinkService.showBackLink();
    }
  }
}
