import { Component, Input, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { UpdateBannerProps } from '@core/model/update-banner.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';
import { TabsService } from '@core/services/tabs.service';
import { DateUtil } from '@core/utils/date-util';
import { FormatUtil } from '@core/utils/format-util';
import { SubsidiaryRouterService } from '@shared/services/subsidiary-router-service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

const NO_STAFF_RECORDS_MESSAGE = 'You’ve not added any staff records in the last 12 months';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
  standalone: false,
})
export class SummarySectionComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() workers?: Worker[];
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
  private subscriptions: Subscription = new Subscription();

  constructor(
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private payAndPensionService: PayAndPensionService,
  ) {}

  ngOnInit(): void {
    this.getWorkplaceSummaryMessage();

    this.getStaffSummaryMessage();
    this.getTrainingAndQualsSummary();
    this.showViewSummaryLinks();

    this.isParent = this.workplace?.isParent;
    this.getOtherWorkplacesSummaryMessage();

    this.setupUpdateBanner();
  }

  public async onClick(event: Event, section: Section): Promise<void> {
    event.preventDefault();

    const { fragment, route, skipTabSwitch = false, scrollToId, onClickHook } = section;

    if (onClickHook) {
      onClickHook();
    }

    if (scrollToId) {
      const destinationUrl = route ?? ['/dashboard'];
      const extras = route ? {} : { fragment };
      const router = this.router as SubsidiaryRouterService;

      router.navigateAndScrollToAnchor(destinationUrl, scrollToId, extras);
      return;
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
      this.sections[0].scrollToId = 'check-cqc-details-banner';
      return;
    }

    const notAllTurnoverDataAnswered = [vacancies, leavers, starters].some((value) => !value);

    if (notAllTurnoverDataAnswered) {
      const missingOnes = Object.entries({ starters, leavers, vacancy: vacancies })
        .filter(([_key, value]) => !value)
        .map(([key, _value]) => key);

      const message = `Add your ${FormatUtil.joinNouns(missingOnes)} data`;
      this.sections[0].message = message;

      const linkToAddSLVMiniFlow = [vacancies, leavers, starters].every((value) => !value);
      if (linkToAddSLVMiniFlow) {
        this.sections[0].route = [
          'workplace',
          this.workplace.uid,
          'workplace-data',
          'add-starters-leavers-vacancies-data',
        ];
        this.sections[0].skipTabSwitch = true;
      } else {
        this.sections[0].scrollToId = 'vacancies-and-turnover';
      }

      return;
    }

    const vacanciesOverOneYear = DateUtil.isMoreThanOneYearAgo(vacanciesSavedAt);
    const startersOverOneYear = DateUtil.isMoreThanOneYearAgo(startersSavedAt);
    const leaversOverOneYear = DateUtil.isMoreThanOneYearAgo(leaversSavedAt);

    const someDataOutdated = [vacanciesOverOneYear, startersOverOneYear, leaversOverOneYear].some((x) => x);
    const linkToUpdateSLVMiniFlow = [vacanciesOverOneYear, startersOverOneYear, leaversOverOneYear].every((x) => x);

    if (someDataOutdated) {
      const outdatedOnes = [
        ['starters', startersOverOneYear],
        ['leavers', leaversOverOneYear],
        ['vacancy', vacanciesOverOneYear],
      ]
        .filter(([_key, outdated]) => outdated)
        .map(([key, _outdated]) => key) as string[];

      const message = `Update your ${FormatUtil.joinNouns(outdatedOnes)} data`;
      this.sections[0].message = message;

      if (linkToUpdateSLVMiniFlow) {
        this.sections[0].route = [
          'workplace',
          this.workplace.uid,
          'workplace-data',
          'update-starters-leavers-vacancies-data',
        ];
        this.sections[0].skipTabSwitch = true;
      } else {
        this.sections[0].scrollToId = 'vacancies-and-turnover';
      }
      return;
    }

    if (numberOfStaff === undefined || numberOfStaff === null) {
      this.sections[0].message = `You've not added your total number of staff`;
      this.sections[0].redFlag = true;
      return;
    }

    if (numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin() && this.canViewListOfWorkers) {
      this.sections[0].message = 'Staff total does not match number of staff records';
      this.sections[0].scrollToId = 'workplace-details';

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
      return;
    }

    const oneYearAfterWorkplaceCreated = dayjs(this.workplace.created).add(12, 'M');
    const oneYearAfterstaffRecordMessageDismissed = dayjs(this.workplace.lastStaffRecordMessageDismissedAt).add(
      12,
      'M',
    );

    if (!this.workerCount) {
      this.sections[1].message = 'Start adding your staff records';
      return;
    }

    if (this.workplace.numberOfStaff !== this.workerCount && this.afterEightWeeksFromFirstLogin()) {
      this.sections[1].message = 'Number of staff records does not match total staff';
      return;
    }

    if (this.noOfWorkersWhoRequireInternationalRecruitment > 0) {
      this.showInternationalRecruitmentMessage();
      return;
    }

    const today = dayjs();
    const showNoStaffRecordsMessage =
      this.workplace.numberOfStaff > 10 &&
      today >= oneYearAfterWorkplaceCreated &&
      today >= this.oneYearAfterLatestWorkerCreatedDate() &&
      (!this.workplace.lastStaffRecordMessageDismissedAt || today >= oneYearAfterstaffRecordMessageDismissed);

    if (showNoStaffRecordsMessage) {
      this.sections[1].message = NO_STAFF_RECORDS_MESSAGE;
      this.sections[1].onClickHook = () => this.updateLastStaffRecordMessageDismissedAt();
      return;
    }

    if (this.workersNotCompleted?.length > 0 && this.workerNotCompletedOverOneMonth()) {
      this.sections[1].message = 'Add more details to your staff records';
      if (this.isParentSubsidiaryView) {
        this.sections[1].route = ['/staff-basic-records', this.workplace.uid];
      } else {
        this.sections[1].route = ['/staff-basic-records'];
      }
      return;
    }
  }

  public getTrainingAndQualsSummary(): void {
    const hasMissingMandatory = this.trainingCounts?.staffMissingMandatoryTraining;
    const hasExpired = this.trainingCounts?.totalExpiredTraining;
    const hasExpiringSoon = this.trainingCounts?.totalExpiringTraining;

    if (hasMissingMandatory || hasExpired) {
      this.sections[2].redFlag = true;
      this.sections[2].message = 'You need to check your training records';
      this.sections[2].scrollToId = 'training-info-panel';
      return;
    }

    if (hasExpiringSoon) {
      this.sections[2].message = 'You need to check your training records';
      this.sections[2].scrollToId = 'training-info-panel';
      return;
    }

    if (this.trainingCounts?.totalRecords === 0 && this.trainingCounts?.totalTraining == 0) {
      this.sections[2].link = false;
      this.sections[2].message = 'Manage your staff training and qualifications';
      return;
    }
  }

  private workerNotCompletedOverOneMonth() {
    if (this.workersNotCompleted) {
      const filterDate = this.workersNotCompleted.filter(
        (workerDate: any) => dayjs() > dayjs(new Date(workerDate.created)).add(1, 'M'),
      );
      return filterDate?.length > 0;
    }
  }

  private oneYearAfterLatestWorkerCreatedDate() {
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
      return;
    }

    if (this.showMissingCqcMessage) {
      this.otherWorkplacesSection.message = 'Have you added all of your workplaces?';
      this.otherWorkplacesSection.link = true;
      this.otherWorkplacesSection.orangeFlag = true;
      return;
    }

    if (this.workplacesNeedAttention) {
      this.otherWorkplacesSection.message = 'You need to check your other workplaces';
      this.otherWorkplacesSection.link = true;
      this.otherWorkplacesSection.redFlag = true;
      return;
    }

    this.otherWorkplacesSection.message = 'Check and update your other workplaces often';
    this.otherWorkplacesSection.link = false;
  }

  public showViewSummaryLinks(): void {
    if (!this.canViewEstablishment) {
      this.sections[0].link = false;
    }

    if (!this.canViewListOfWorkers) {
      this.sections[1].link = false;
      this.sections[2].link = false;
    }
  }

  private updateSingleEstablishmentField(dataToUpdate: any): void {
    this.establishmentService.updateSingleEstablishmentField(this.workplace.uid, dataToUpdate).subscribe();
  }

  private updateLastStaffRecordMessageDismissedAt(): void {
    const payload = {
      property: 'lastStaffRecordMessageDismissedAt',
      value: new Date(),
    };

    this.establishmentService.updateSingleEstablishmentField(this.workplace.uid, payload).subscribe((response) => {
      if (!response?.data) {
        return;
      }

      const { lastStaffRecordMessageDismissedAt } = response.data;
      if (lastStaffRecordMessageDismissedAt) {
        this.workplace.lastStaffRecordMessageDismissedAt = lastStaffRecordMessageDismissedAt;
      }
    });
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

    // Blue update banner for Care workforce pathway worker question is disabled temporarily, as CWP roles category update is planned ahead
    // this.setupUpdateBannerForCWPWorkerQuestion();

    this.setupUpdateBannerForDHAWorkplaceQuestion();
    this.setupUpdateBannerForDHAWorkerQuestion();
    this.setupUpdateBannerForNursesQuestions();
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

  private setupUpdateBannerForNursesQuestions(): void {
    if (this.updateBanner()) {
      return;
    }

    const nurses = this.workers?.filter((worker) => worker.mainJob?.jobRoleName === 'Registered nurse') ?? [];

    if (nurses.length === 0) {
      return;
    }

    const linkTo =
      nurses.length === 1
        ? ['/workplace', this.workplace.uid, 'staff-record', nurses[0].uid!, 'staff-record-summary', 'nursing-category']
        : this.router.createUrlTree(['/dashboard'], {
            fragment: 'staff-records',
          });

    this.updateBanner.set({
      content: "Review and confirm your nurses' NMC fields of practice",
      linkText: 'Review details',
      linkAriaDescription: 'about nurses questions',
      linkTo,
      onLinkClicked: () => {
        this.setReturnToHomeTab();
      },
    });
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

export interface Section {
  linkText: string;
  link: boolean;
  message: string;
  fragment?: string;
  route?: string[];
  redFlag?: boolean;
  orangeFlag?: boolean;
  skipTabSwitch?: boolean;
  showMessageAsText?: boolean;
  scrollToId?: string;
  onClickHook?: () => void;
}
