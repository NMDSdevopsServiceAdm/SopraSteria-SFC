import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
})
export class SummarySectionComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workerCount: number;
  @Input() workersCreatedDate;
  @Input() trainingCounts: TrainingCounts;
  @Input() navigateToTab: (event: Event, selectedTab: string) => void;
  @Input() workersNotCompleted: Worker[];
  @Input() canViewListOfWorkers: boolean;
  @Input() canViewEstablishment: boolean;
  @Input() canEditWorker: boolean;
  @Input() showMissingCqcMessage: boolean;
  @Input() workplacesCount: number;
  @Input() isParentSubsidiaryView: boolean;
  @Input() noOfWorkersWhoRequireInternationalRecruitment: number;
  @Input() noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered: number;
  @Input() cwpQuestionsFlag: boolean;
  @Input() workplacesNeedAttention: boolean;

  public sections: Section[] = [
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
    redFlag: false,
    link: true,
  };

  public isParent: boolean;
  private careWorkforcePathwayLinkDisplaying: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();
    this.getStaffCreatedDate();
    this.getStaffSummaryMessage();
    this.getTrainingAndQualsSummary();
    this.isParent = this.workplace?.isParent;
    this.getOtherWorkplacesSummaryMessage();
  }

  public async onClick(event: Event, fragment: string, route: string[], skipTabSwitch: boolean = false): Promise<void> {
    event.preventDefault();
    if (this.careWorkforcePathwayLinkDisplaying && fragment == 'workplace') {
      this.setCwpAwarenessQuestionViewed();
      this.establishmentService.setReturnTo({ url: ['/dashboard'], fragment: 'home' });
    }

    if (this.isParentSubsidiaryView) {
      return await this.navigateInSubView(fragment, route);
    }

    if (route) {
      await this.router.navigate(route);
    }

    if (fragment && !skipTabSwitch) {
      this.tabsService.selectedTab = fragment;
    }
  }

  private navigateInSubView = async (fragment: string, route: string[]) => {
    this.tabsService.selectedTab = fragment;
    await this.router.navigate(route ? route : ['subsidiary', this.workplace.uid, fragment]);
  };

  public getWorkplaceSummaryMessage(): void {
    const { showAddWorkplaceDetailsBanner, numberOfStaff, vacancies, starters, leavers } = this.workplace;
    this.sections[0].redFlag = false;
    if (showAddWorkplaceDetailsBanner) {
      this.sections[0].message = 'Add more details to your workplace';
    } else if (!this.workplace.CWPAwarenessQuestionViewed && !this.workplace.careWorkforcePathwayWorkplaceAwareness) {
      this.sections[0].message = 'How aware of the CWP is your workplace?';
      this.sections[0].route = ['/workplace', this.workplace.uid, 'care-workforce-pathway-awareness'];
      this.careWorkforcePathwayLinkDisplaying = true;
    } else if (this.establishmentService.checkCQCDetailsBanner) {
      this.sections[0].message = 'You need to check your CQC details';
    } else if (numberOfStaff === undefined || numberOfStaff === null) {
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
    if (!this.canViewListOfWorkers) {
      this.showViewSummaryLinks(this.sections[1].linkText);
      return;
    }

    const afterWorkplaceCreated = dayjs(this.workplace.created).add(12, 'M');
    if (!this.workerCount) {
      this.sections[1].message = 'You can start to add your staff records now';
    } else if (this.noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered > 0 && !this.cwpQuestionsFlag) {
      this.sections[1].message = 'Where are your staff on the care workforce pathway?';
      this.sections[1].skipTabSwitch = true;
      this.sections[1].route = [
        '/workplace',
        this.workplace.uid,
        'staff-record',
        'care-workforce-pathway-workers-summary',
      ];
      this.sections[1].showMessageAsText = !this.canEditWorker;
    } else if (this.workplace.numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[1].message = 'Staff records added does not match staff total';
    } else if (this.noOfWorkersWhoRequireInternationalRecruitment > 0) {
      this.showInternationalRecruitmentMessage();
    } else if (
      dayjs() >= afterWorkplaceCreated &&
      this.workplace.numberOfStaff > 10 &&
      dayjs() >= this.getWorkerLatestCreatedDate()
    ) {
      this.sections[1].message = 'No staff records added in the last 12 months';
    } else if (this.workersNotCompleted?.length > 0 && this.getStaffCreatedDate()) {
      this.sections[1].message = 'Some records only have mandatory data added';
      if (this.isParentSubsidiaryView) {
        this.sections[1].route = ['/staff-basic-records', this.workplace.uid];
      } else {
        this.sections[1].route = ['/staff-basic-records'];
      }
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

  private showInternationalRecruitmentMessage(): void {
    const singularQuestion = 'Is this worker on a Health and Care Worker visa?';
    const pluralQuestion = 'Are these workers on Health and Care Worker visas?';
    this.sections[1].message =
      this.noOfWorkersWhoRequireInternationalRecruitment === 1 ? singularQuestion : pluralQuestion;
    this.sections[1].route = ['/workplace', this.workplace.uid, 'health-and-care-visa-existing-workers'];
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
    } else if (this.workplacesNeedAttention) {
      this.otherWorkplacesSection.message = 'You need to check your other workplaces';
      this.otherWorkplacesSection.link = true;
      this.otherWorkplacesSection.redFlag = true;
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

  private setCwpAwarenessQuestionViewed(): void {
    const cwpData = {
      property: 'CWPAwarenessQuestionViewed',
      value: true,
    };
    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.workplace.uid, cwpData).subscribe(),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

interface Section {
  linkText: string;
  fragment: string;
  message: string;
  route: string[];
  redFlag: boolean;
  link: boolean;
  skipTabSwitch?: boolean;
  showMessageAsText?: boolean;
}
