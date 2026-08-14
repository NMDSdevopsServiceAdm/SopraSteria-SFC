import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, UrlTree } from '@angular/router';
import { Establishment, Leaver, Starter, Vacancy } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService, WorkplaceUpdateFlowType } from '@core/services/vacancies-and-turnover.service';
import { DateUtil } from '@core/utils/date-util';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-add-update-starters-leavers-vacancies-data',
  templateUrl: './add-update-starters-leavers-vacancies-data.component.html',
  styleUrl: './add-update-starters-leavers-vacancies-data.component.scss',
  imports: [SharedModule, CommonModule, RouterModule],
})
export class AddUpdateStartersLeaversVacanciesDataComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private backLinkService: BackLinkService,
    private vacanciesAndTurnoverService: VacanciesAndTurnoverService,
    private alertService: AlertService,
  ) {}

  public workplace: Establishment;
  public flowType: WorkplaceUpdateFlowType;
  public allPagesSubmitted: boolean = false;
  public todayOneYearAgo = DateUtil.getDateForOneYearAgo();
  public returnTo: UrlTree;
  public heading: string;
  public successfulAlert: string;
  public rows: SummaryListRow[] = [];

  ngOnInit(): void {
    this.workplace = this.route.snapshot.data.establishment;
    this.flowType = this.route.snapshot?.data?.flowType ?? WorkplaceUpdateFlowType.ADD_SLV;
    this.backLinkService.showBackLink();

    this.setupText();
    this.setupTable();
    this.setReturnTo();

    this.showAlertIfAllPagesSubmitted();
  }

  private setupText(): void {
    this.heading =
      this.flowType === WorkplaceUpdateFlowType.ADD_SLV
        ? 'Add your starters, leavers and vacancy data'
        : 'Update your starters, leavers and vacancy data';

    this.successfulAlert =
      this.flowType === WorkplaceUpdateFlowType.ADD_SLV
        ? 'Starters, leavers and vacancy data added'
        : 'Starters, leavers and vacancy information saved';
  }

  private setupTable(): void {
    const oneYearAgo = DateUtil.getDateForOneYearAgo();
    this.rows = [
      {
        id: 'starters',
        label: `Starters since ${oneYearAgo}`,
        data: this.workplace.starters,
        route: ['update-starters'],
      },
      {
        id: 'leavers',
        label: `Leavers since ${oneYearAgo}`,
        data: this.workplace.leavers,
        route: ['update-leavers'],
      },
      {
        id: 'vacancies',
        label: 'Current staff vacancies',
        data: this.workplace.vacancies,
        route: ['update-vacancies'],
      },
    ];
  }

  private showAlertIfAllPagesSubmitted(): void {
    const allPagesSubmitted = this.vacanciesAndTurnoverService.allUpdatePagesSubmitted(this.flowType);
    const hasViewedSavedBanner = this.vacanciesAndTurnoverService.hasViewedSavedBanner;

    if (allPagesSubmitted && !hasViewedSavedBanner) {
      this.alertService.addAlert({
        type: 'success',
        message: this.successfulAlert,
      });

      this.vacanciesAndTurnoverService.hasViewedSavedBanner = true;
    }
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  public setReturnTo(): void {
    this.returnTo = this.router.createUrlTree(['/dashboard'], { fragment: 'home' });
  }

  public isArray(variable: any): boolean {
    return Array.isArray(variable);
  }
}

interface SummaryListRow {
  id: 'starters' | 'leavers' | 'vacancies';
  label: string;
  data: string | Starter[] | Leaver[] | Vacancy[];
  route: string[];
}
