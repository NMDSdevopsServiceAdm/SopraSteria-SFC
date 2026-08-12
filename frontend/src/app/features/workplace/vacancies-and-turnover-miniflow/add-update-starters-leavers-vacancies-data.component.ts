import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment, Leaver, Starter, Vacancy } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { DateUtil } from '@core/utils/date-util';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-add-update-starters-leavers-vacancies-data',
  templateUrl: './add-update-starters-leavers-vacancies-data.component.html',
  styleUrl: './add-update-starters-leavers-vacancies-data.component.scss',
  imports: [SharedModule, CommonModule],
})
export class AddUpdateStartersLeaversVacanciesDataComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private establishmentService: EstablishmentService,
    private backLinkService: BackLinkService,
    private vacanciesAndTurnoverService: VacanciesAndTurnoverService,
    private alertService: AlertService,
  ) {}

  public workplace: Establishment;
  public allPagesSubmitted: boolean = false;
  public todayOneYearAgo = DateUtil.getDateForOneYearAgo();
  // public WorkplaceUpdateFlowType = WorkplaceUpdateFlowType;
  // public flowType: WorkplaceUpdateFlowType;
  // private totalNumberOfStaff: number;

  public rows: SummaryListRow[] = [];

  ngOnInit(): void {
    this.workplace = this.route.snapshot.data.establishment;
    this.workplace.leavers;
    this.backLinkService.showBackLink();
    this.setupRows();
  }

  private setupRows(): void {
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
