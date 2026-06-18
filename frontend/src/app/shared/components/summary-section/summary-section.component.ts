import { Component, Input, OnDestroy, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { UpdateBannerProps } from '@core/model/update-banner.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { TabsService } from '@core/services/tabs.service';
import { DateUtil } from '@core/utils/date-util';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
  standalone: false,
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
  @Input() canEditEstablishment: boolean;
  @Input() showMissingCqcMessage: boolean;
  @Input() workplacesCount: number;
  @Input() isParentSubsidiaryView: boolean;
  @Input() noOfWorkersWhoRequireInternationalRecruitment: number;
  @Input() noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered: number;
  @Input() noOfWorkersWithDelegatedHealthcareUnanswered: number;
  @Input() workplacesNeedAttention: boolean;
  @Input() showCheckCqcDetails: boolean;

  public updateBanner: WritableSignal<UpdateBannerProps | null> = signal(null);

  public sections: Section[] = [
    {
      linkText: 'Workplace',
      fragment: 'workplace',
      message: '',
      route: undefined,
      redFlag: false,
      link: true,
    },
    {
      linkText: 'Staff records',
      fragment: 'staff-records',
      message: '',
      route: undefined,
      redFlag: false,
      link: true,
    },
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
  private payAndPensionWorkplaceQuestionsLinkDisplaying: boolean;
  private setReturn: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private payAndPensionService: PayAndPensionService,
  ) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();
    this.showViewSummaryLinks(this.sections[0].linkText);

    this.getStaffCreatedDate();
    this.getStaffSummaryMessage();
    this.getTrainingAndQualsSummary();
    this.isParent = this.workplace?.isParent;
    this.getOtherWorkplacesSummaryMessage();

    this.setupUpdateBanner();
  }

  public async onClick(event: Event, fragment: string, route: string[], skipTabSwitch: boolean = false): Promise<void> {
    event.preventDefault();
    if (this.payAndPensionWorkplaceQuestionsLinkDisplaying && fragment == 'workplace') {
      this.payAndPensionService.setInPayAndPensionsMiniFlow(true);
      this.setPayAndPensionsMiniFlowViewed();
    }

    if (this.careWorkforcePathwayLinkDisplaying && fragment == 'workplace') {
      this.setCwpAwarenessQuestionViewed();
    }

    if (this.setReturn) {
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
    const {
      showAddWorkplaceDetailsBanner,
      numberOfStaff,
      vacancies,
      starters,
      leavers,
      vacanciesSavedAt,
      startersSavedAt,
      leaversSavedAt,
    } = this.workplace;
    this.sections[0].redFlag = false;

    if (showAddWorkplaceDetailsBanner) {
      this.sections[0].message = 'Finish adding your workplace data';
      return;
    }
    if (this.showCheckCqcDetails) {
      this.sections[0].message = 'Your workplace details do not match your CQC details';
      return;
    }

    if (numberOfStaff === undefined || numberOfStaff === null) {
      this.sections[0].message = `You've not added your total number of staff`;
      this.sections[0].redFlag = true;
      return;
    }

    if (numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin() && this.canViewListOfWorkers) {
      this.sections[0].message = 'Staff total does not match number of staff records';
      return;
    }

    if (!vacancies && !leavers && !starters) {
      this.sections[0].message = `Add your vacancy, starters and leavers data`;
      return;
    } else if (!vacancies) {
      this.sections[0].message = `Add your vacancy data`;
      return;
    } else if (!leavers || !starters) {
      this.sections[0].message = `Add your starters and leavers data`;
      return;
    }

    const vacanciesOverOneYear = DateUtil.isMoreThanOneYearAgo(vacanciesSavedAt);
    const startersOverOneYear = DateUtil.isMoreThanOneYearAgo(startersSavedAt);
    const leaversOverOneYear = DateUtil.isMoreThanOneYearAgo(leaversSavedAt);

    if (vacanciesOverOneYear && startersOverOneYear && leaversOverOneYear) {
      this.sections[0].message = `Update your starter, leaver and vacancy data`;
      return;
    } else if (vacanciesOverOneYear) {
      this.sections[0].message = `Update your staff vacancy data`;
      return;
    } else if (startersOverOneYear || leaversOverOneYear) {
      this.sections[0].message = `Update your starters and leavers data`;
      return;
    }
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
    const hasMissingMandatory = this.trainingCounts?.staffMissingMandatoryTraining;
    const hasExpired = this.trainingCounts?.totalExpiredTraining;
    const hasExpiringSoon = this.trainingCounts?.totalExpiringTraining;

    if (hasMissingMandatory || hasExpired) {
      this.sections[2].redFlag = true;
      this.sections[2].message = 'You need to check your training records';
    } else if (hasExpiringSoon) {
      this.sections[2].message = 'You need to check your training records';
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

  checkVacanciesStartersLeaversLastSavedDates() {
    const { vacanciesSavedAt, startersSavedAt, leaversSavedAt } = this.workplace;
    const today = dayjs();

    const vacanciesOverOneYear = dayjs(vacanciesSavedAt).add(12, 'M').isBefore(today, 'day');
    const startersOverOneYear = dayjs(startersSavedAt).add(12, 'M').isBefore(today, 'day');
    const leaversOverOneYear = dayjs(leaversSavedAt).add(12, 'M').isBefore(today, 'day');

    return { vacanciesOverOneYear, startersOverOneYear, leaversOverOneYear };
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

  private updateSingleEstablishmentField(dataToUpdate: any): void {
    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.workplace.uid, dataToUpdate).subscribe(),
    );
  }

  private setCwpAwarenessQuestionViewed(): void {
    const cwpData = {
      property: 'CWPAwarenessQuestionViewed',
      value: true,
    };
    this.updateSingleEstablishmentField(cwpData);
  }

  private setPayAndPensionsMiniFlowViewed(): void {
    const payAndPensionData = {
      property: 'payAndPensionsMiniFlowViewed',
      value: true,
    };
    this.updateSingleEstablishmentField(payAndPensionData);
  }

  public navigateToYourOtherWorkplaces(event: Event, yourOtherWorkplacesSortValue: string) {
    event.preventDefault();
    localStorage.setItem('yourOtherWorkplacesSortValue', yourOtherWorkplacesSortValue);
    this.router.navigate(['/workplace', 'view-all-workplaces']);
  }

  public setupUpdateBanner() {
    this.setupUpdateBannerForPayAndPensionWorkplaceQuestions();
    this.setupUpdateBannerForCWPWorkplaceAwareness();
    this.setupUpdateBannerForCWPWorkerQuestion();
    this.setupUpdateBannerForDHAWorkplaceQuestion();
    this.setupUpdateBannerForDHAWorkerQuestion();
  }

  private setupUpdateBannerForPayAndPensionWorkplaceQuestions() {
    if (this.updateBanner()) {
      return;
    }

    const { mainService, payAndPensionsMiniFlowViewed } = this.workplace;
    const showBanner =
      this.payAndPensionService.showSleepInsQuestions(mainService.payAndPensionsGroup) &&
      !payAndPensionsMiniFlowViewed &&
      this.canEditEstablishment;

    if (showBanner) {
      this.updateBanner.set({
        content: 'New questions about pay and pensions',
        linkText: 'Answer questions',
        linkAriaDescription: ' about pay and pensions',
        linkTo: this.establishmentService.buildPathForWorkplaceSummary(this.workplace.uid, 'pensions'),
        onLinkClicked: () => {
          this.payAndPensionService.setInPayAndPensionsMiniFlow(true);
          this.setPayAndPensionsMiniFlowViewed();
          this.setReturnToHomeTab();
        },
      });
    }
  }

  private setupUpdateBannerForCWPWorkplaceAwareness() {
    if (this.updateBanner()) {
      return;
    }

    const { CWPAwarenessQuestionViewed, careWorkforcePathwayWorkplaceAwareness } = this.workplace;

    if (!CWPAwarenessQuestionViewed && !careWorkforcePathwayWorkplaceAwareness && this.canEditEstablishment) {
      this.updateBanner.set({
        content: 'How aware of the care workforce pathway is your workplace?',
        linkText: 'Answer questions',
        linkAriaDescription: ' about How aware of the care workforce pathway is your workplace',
        linkTo: this.establishmentService.buildPathForWorkplaceSummary(
          this.workplace.uid,
          'care-workforce-pathway-awareness',
        ),
        onLinkClicked: () => {
          this.setCwpAwarenessQuestionViewed();
          this.setReturnToHomeTab();
        },
      });
    }
  }

  private setupUpdateBannerForCWPWorkerQuestion() {
    if (this.updateBanner()) {
      return;
    }
    const showBanner = this.noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered > 0 && this.canEditWorker;

    if (showBanner) {
      this.updateBanner.set({
        content: 'Where are your staff on the care workforce pathway?',
        linkText: 'Answer questions',
        linkAriaDescription: ' about Where are your staff on the care workforce pathway',
        linkTo: ['/workplace', this.workplace.uid, 'staff-record', 'care-workforce-pathway-workers-summary'],
      });
    }
  }

  private setupUpdateBannerForDHAWorkplaceQuestion() {
    if (this.updateBanner()) {
      return;
    }
    const showBanner =
      !this.workplace.staffDoDelegatedHealthcareActivities &&
      this.workplace.mainService.canDoDelegatedHealthcareActivities &&
      this.canEditEstablishment;

    if (showBanner) {
      this.updateBanner.set({
        content: 'Do your staff carry out delegated healthcare activities?',
        linkTo: this.establishmentService.buildPathForWorkplaceSummary(
          this.workplace.uid,
          'staff-do-delegated-healthcare-activities',
        ),
        linkAriaDescription: ' about Do your staff carry out delegated healthcare activities?',
        onLinkClicked: () => {
          this.setReturnToHomeTab();
        },
      });
    }
  }

  private setupUpdateBannerForDHAWorkerQuestion() {
    if (this.updateBanner()) {
      return;
    }

    const showBanner =
      this.workplace.staffDoDelegatedHealthcareActivities !== 'No' &&
      this.workplace.mainService.canDoDelegatedHealthcareActivities &&
      this.noOfWorkersWithDelegatedHealthcareUnanswered > 0 &&
      this.canEditWorker;

    if (showBanner) {
      this.updateBanner.set({
        content: 'Who carries out delegated healthcare activities?',
        linkTo: ['/workplace', this.workplace.uid, 'staff-record', 'who-carry-out-delegated-healthcare-activities'],
        linkAriaDescription: ' about Who carries out delegated healthcare activities?',
        onLinkClicked: () => {
          this.setReturnToHomeTab();
        },
      });
    }
  }

  private setReturnToHomeTab() {
    this.establishmentService.setReturnTo({ url: ['/dashboard'], fragment: 'home' });
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
