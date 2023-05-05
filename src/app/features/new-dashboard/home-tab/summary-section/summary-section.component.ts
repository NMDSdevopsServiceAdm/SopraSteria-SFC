import { Component, Input, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import dayjs from 'dayjs';
import { Worker } from '@core/model/worker.model';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
})
export class SummarySectionComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() workerCount: number;
  @Input() workerCreatedDate;

  @Input() trainingCounts: TrainingCounts;
  @Input() navigateToTab: (event: Event, selectedTab: string) => void;

  public sections = [
    { linkText: 'Workplace', fragment: 'workplace', message: '', route: undefined, redFlag: false, link: true },
    { linkText: 'Staff records', fragment: 'staff-records', message: '', route: undefined, redFlag: false, link: true },
    {
      linkText: 'Training and qualifications',
      fragment: 'training-and-qualifications',
      message: '',
      route: undefined,
      redFlag: false,
      link: true
    },
  ];

  constructor(
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();
    this.getStaffSummaryMessage();
    this.getTrainingAndQualsSummary();
  }

  public async onClick(event: Event, fragment: string, route: string[]): Promise<void> {
    event.preventDefault();
    if (route) {
      await this.router.navigate(route);
    }
    this.navigateToTab(event, fragment);
  }

  public getWorkplaceSummaryMessage(): void {
    const { showAddWorkplaceDetailsBanner, numberOfStaff, vacancies, starters, leavers } = this.workplace;

    this.sections[0].redFlag = false;
    if (showAddWorkplaceDetailsBanner) {
      this.sections[0].message = 'Add more details to your workplace';
    } else if (this.establishmentService.checkCQCDetailsBanner) {
      this.sections[0].message = 'You need to check your CQC details';
    } else if (!numberOfStaff) {
      this.sections[0].message = `You've not added your total number of staff`;
      this.sections[0].redFlag = true;
    } else if (numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[0].message = 'Staff total does not match staff records added';
    } else if (!vacancies && !leavers && !starters) {
      this.sections[0].message = `You've not added any vacancy and turnover data`;
    } else if (!vacancies && (leavers || starters)) {
      this.sections[0].message = `You've not added any staff vacancy data`;
    }
  }

  private afterEightWeeksFromFirstLogin(): boolean {
    const eightWeeksFromFirstLogin =
      this.workplace.eightWeeksFromFirstLogin && new Date(this.workplace.eightWeeksFromFirstLogin) < new Date();

    return eightWeeksFromFirstLogin;
  }

  public getStaffSummaryMessage(): void {
    const afterWorkplaceCreated = dayjs(this.workplace.created).add(12, 'M');
    const afterWorkerCreated = dayjs(this.workerCreatedDate).add(12, 'M');

    if (!this.workerCount) {
      this.sections[1].message = 'You can start to add your staff records now';
    } else if (this.workplace.numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[1].message = 'Staff records added does not match staff total';
    } else if (dayjs() >= afterWorkplaceCreated && this.workplace.numberOfStaff > 10 && dayjs() >= afterWorkerCreated) {
      this.sections[1].message = 'No staff records added in the last 12 months';
    }
  }

  public getTrainingAndQualsSummary(): void {
    if (this.trainingCounts.missingMandatoryTraining) {
      this.sections[2].redFlag = true;
      this.sections[2].message = `${this.trainingCounts.missingMandatoryTraining} staff ${
        this.trainingCounts.missingMandatoryTraining > 1 ? 'are' : 'is'
      } missing mandatory training`;
      this.sections[2].route = [
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications',
        'missing-mandatory-training',
      ];
    } else if (this.trainingCounts.totalExpiredTraining) {
      this.sections[2].redFlag = true;
      this.sections[2].message = `${this.trainingCounts.totalExpiredTraining} training record${
        this.trainingCounts.totalExpiredTraining > 1 ? 's have' : ' has'
      } expired`;
      this.sections[2].route = ['/workplace', this.workplace.uid, 'training-and-qualifications', 'expired-training'];
    } else if (this.trainingCounts.totalExpiringTraining) {
      this.sections[2].message = `${this.trainingCounts.totalExpiringTraining} training record${
        this.trainingCounts.totalExpiringTraining > 1 ? 's expire' : ' expires'
      } soon`;
      this.sections[2].route = [
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications',
        'expires-soon-training',
      ];
    } else if (this.trainingCounts.totalRecords === 0 && this.trainingCounts.totalTraining == 0) {
      this.sections[2].link = false;
      this.sections[2].message = 'Manage your staff training and qualifications';
    }
  }
}
