import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import dayjs from 'dayjs';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
})
export class SummarySectionComponent implements OnInit, OnChanges {
  @Input() workplace: Establishment;
  @Input() workerCount: number;
  @Input() workersCreatedDate;
  @Input() trainingCounts: TrainingCounts;
  @Input() navigateToTab: (event: Event, selectedTab: string) => void;
  @Input() workersNotCompleted: Worker[];
  @Input() canViewListOfWorkers: boolean;
  @Input() canViewEstablishment: boolean;
  @Input() showMissingCqcMessage: boolean;
  @Input() workplacesCount: number;
  @Input() isParentSubsidiaryView: boolean;

  public sections = [
    { linkText: 'Workplace', fragment: 'workplace', message: '', route: undefined, redFlag: false, link: true },
    { linkText: 'Staff records', fragment: 'staff-records', message: '', route: undefined, redFlag: false, link: true },
    {
      linkText: 'Training and qualifications',
      fragment: 'training-and-qualifications',
      message: '',
      route: undefined,
      redFlag: false,
      link: true,
    },
  ];

  public otherWorkplacesSection = {
    linkText: 'Your other workplaces',
    message: '',
    orangeFlag: false,
    link: true,
  };

  public isParent: boolean;

  constructor(
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();
    this.getStaffCreatedDate();
    this.getStaffSummaryMessage();
    this.getTrainingAndQualsSummary();
    this.isParent = this.workplace?.isParent;
    this.getOtherWorkplacesSummaryMessage();
  }

  ngOnChanges(): void {}

  public async onClick(event: Event, fragment: string, route: string[]): Promise<void> {
    event.preventDefault();

    if (this.isParentSubsidiaryView) {
      await this.router.navigate(['/subsidiary/', fragment, this.workplace.uid]);
    }
    if (route) {
      await this.router.navigate(route);
    }

    this.parentSubsidiaryViewService.showSelectedTab = fragment;

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
    this.showViewSummaryLinks(this.sections[0].linkText);
  }

  private afterEightWeeksFromFirstLogin(): boolean {
    const eightWeeksFromFirstLogin =
      this.workplace.eightWeeksFromFirstLogin && new Date(this.workplace.eightWeeksFromFirstLogin) < new Date();

    return eightWeeksFromFirstLogin;
  }

  public getStaffSummaryMessage(): void {
    const afterWorkplaceCreated = dayjs(this.workplace.created).add(12, 'M');
    if (!this.workerCount) {
      this.sections[1].message = 'You can start to add your staff records now';
    } else if (this.workplace.numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[1].message = 'Staff records added does not match staff total';
    } else if (
      dayjs() >= afterWorkplaceCreated &&
      this.workplace.numberOfStaff > 10 &&
      dayjs() >= this.getWorkerLatestCreatedDate()
    ) {
      this.sections[1].message = 'No staff records added in the last 12 months';
    } else if (this.workersNotCompleted?.length > 0 && this.getStaffCreatedDate()) {
      this.sections[1].message = 'Some records only have mandatory data added';
      this.sections[1].route = ['/staff-basic-records'];
    }
    this.showViewSummaryLinks(this.sections[1].linkText);
  }

  public getTrainingAndQualsSummary(): void {
    if (this.trainingCounts?.staffMissingMandatoryTraining) {
      this.sections[2].redFlag = true;
      this.sections[2].message = `${this.trainingCounts.staffMissingMandatoryTraining} staff ${
        this.trainingCounts.staffMissingMandatoryTraining > 1 ? 'are' : 'is'
      } missing mandatory training`;
      this.sections[2].route = [
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications',
        'missing-mandatory-training',
      ];
    } else if (this.trainingCounts?.totalExpiredTraining) {
      this.sections[2].redFlag = true;
      this.sections[2].message = `${this.trainingCounts.totalExpiredTraining} training record${
        this.trainingCounts.totalExpiredTraining > 1 ? 's have' : ' has'
      } expired`;
      this.sections[2].route = ['/workplace', this.workplace.uid, 'training-and-qualifications', 'expired-training'];
    } else if (this.trainingCounts?.totalExpiringTraining) {
      this.sections[2].message = `${this.trainingCounts.totalExpiringTraining} training record${
        this.trainingCounts.totalExpiringTraining > 1 ? 's expire' : ' expires'
      } soon`;
      this.sections[2].route = [
        '/workplace',
        this.workplace.uid,
        'training-and-qualifications',
        'expires-soon-training',
      ];
    } else if (this.trainingCounts?.totalRecords === 0 && this.trainingCounts?.totalTraining == 0) {
      this.sections[2].link = false;
      this.sections[2].message = 'Manage your staff training and qualifications';
    }
    this.showViewSummaryLinks(this.sections[2].linkText);
  }

  getStaffCreatedDate() {
    if (this.workersNotCompleted) {
      const filterDate = this.workersNotCompleted.filter(
        (workerDate: any) => dayjs() > dayjs(new Date(workerDate.created)).add(1, 'M'),
      );
      return filterDate?.length > 0;
    }
  }

  getWorkerLatestCreatedDate() {
    const workerLatestCreatedDate = new Date(Math.max(...this.workersCreatedDate));
    const afterWorkerCreated = dayjs(workerLatestCreatedDate).add(12, 'M');
    return afterWorkerCreated;
  }

  public getOtherWorkplacesSummaryMessage(): void {
    if (this.workplacesCount === 0) {
      this.otherWorkplacesSection.message = "You've not added any other workplaces yet";
      this.otherWorkplacesSection.link = false;
      this.otherWorkplacesSection.orangeFlag = false;
    } else if (this.showMissingCqcMessage) {
      this.otherWorkplacesSection.message = 'Have you added all of your workplaces?';
      this.otherWorkplacesSection.link = true;
      this.otherWorkplacesSection.orangeFlag = true;
    } else {
      this.otherWorkplacesSection.message = 'Check and update your other workplaces often';
      this.otherWorkplacesSection.link = false;
      this.otherWorkplacesSection.orangeFlag = false;
    }
  }

  public showViewSummaryLinks(linkText: string): void {
    if (linkText === this.sections[0].linkText && !this.canViewEstablishment) {
      this.sections[0].link = false;
    } else if (linkText === this.sections[1].linkText && !this.canViewListOfWorkers) {
      this.sections[1].link = false;
    } else if (linkText === this.sections[2].linkText && !this.canViewListOfWorkers) {
      this.sections[2].link = false;
    }
  }
}
