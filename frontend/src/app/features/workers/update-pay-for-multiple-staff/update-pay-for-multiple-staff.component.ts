import lodash from 'lodash';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Establishment,
  SortStaffOptionsForUpdatePay,
  StaffSummarySortByParamMap,
} from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import {
  parseSearchEvent,
  QueryParamsForBackend,
  QueryParamsForWorkerWithPayData,
  SearchEvent,
} from '@core/model/pagination.model';
import { WorkerWithPayData } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { AutoSuggestDataProvider } from '@shared/auto-suggest.model';

const radioButtonLabels = [
  { label: 'Hourly', value: 'Hourly', slug: 'hourly' },
  { label: 'Salary', value: 'Annually', slug: 'annually' },
  { label: 'Not known', value: "Don't know", slug: 'dont-know' },
];
const DontKnow = "Don't know";

@Component({
  selector: 'app-update-pay-for-multiple-staff',
  templateUrl: './update-pay-for-multiple-staff.component.html',
  styleUrl: './update-pay-for-multiple-staff.component.scss',
  standalone: false,
})
export class UpdatePayForMultipleStaffComponent {
  public form: UntypedFormGroup;
  public workplace: Establishment;
  public totalWorkerCount: number;
  public currentWorkerCount: number;
  public workersToShow: WorkerWithPayData[];
  public workerUpdated: WorkerWithPayData[];
  public radioButtonLabels = radioButtonLabels;
  public sortByParamMap = StaffSummarySortByParamMap;
  public sortOptions = SortStaffOptionsForUpdatePay;
  public workplaceUid: string;
  public allJobs: Array<Job>;
  public jobRoleDataProvider: WritableSignal<AutoSuggestDataProvider> = signal(null);
  public showNewPillForFastTrackLink: boolean = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const firstPageWorkers = this.route.snapshot.data.workersWithPayData?.workers ?? [];
    this.workplace = this.establishmentService.establishment;
    this.workplaceUid = this.workplace.uid;
    this.showNewPillForFastTrackLink = !this.workplace.fastTrackPayByJobRolesViewed;

    const totalWorkerCount = this.route.snapshot.data.workersWithPayData?.count;
    this.currentWorkerCount = totalWorkerCount;
    this.totalWorkerCount = totalWorkerCount;

    this.allJobs = this.route.snapshot.data.mainJobRoles;
    this.buildJobDataProvider();

    this.workersToShow = firstPageWorkers;
    this.setupForm();
    this.addWorkersToForm(this.workersToShow);

    this.backLinkService.showBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.group({}),
      jobRoleToSearch: null,
    });
  }

  get workersFormGroup(): FormGroup {
    return this.form.get('workers') as FormGroup;
  }

  private addWorkersToForm(workers: WorkerWithPayData[]): void {
    workers.forEach((worker) => {
      this.workersFormGroup.addControl(worker.uid, this.buildFormControlsForWorker(worker));
    });
  }

  private buildFormControlsForWorker(worker: WorkerWithPayData): FormGroup {
    const payValue = this.formBuilder.control(worker.annualHourlyPay?.value);
    const payRate = this.formBuilder.control(worker.annualHourlyPay?.rate);
    const workerFormControls = this.formBuilder.group({ payValue, payRate });

    const clearPayRateWhenSelectNotKnown = payValue.valueChanges
      .pipe(filter((newValue) => newValue === DontKnow))
      .subscribe(() => {
        payRate.setValue(null, { emitEvent: false });
      });

    const clearNotKnownRadioButtonWhenTypeInPayRate = payRate.valueChanges
      .pipe(
        filter((newValue) => !!newValue),
        filter(() => payValue.value === DontKnow),
      )
      .subscribe(() => {
        payValue.setValue(null, { emitEvent: false });
      });

    this.subscriptions.add(clearPayRateWhenSelectNotKnown);
    this.subscriptions.add(clearNotKnownRadioButtonWhenTypeInPayRate);

    return workerFormControls;
  }

  public handleClickForFastTrackPageLink(): void {
    this.router
      .navigate(['../fast-track-pay-updates'], { relativeTo: this.route })
      .then(() => this.setFastTrackPayByJobRolesViewed());
  }

  private setFastTrackPayByJobRolesViewed(): void {
    if (this.workplace.fastTrackPayByJobRolesViewed) {
      return;
    }

    const data = {
      property: 'fastTrackPayByJobRolesViewed',
      value: true,
    };

    this.establishmentService.updateSingleEstablishmentField(this.workplaceUid, data).subscribe(() => {
      this.establishmentService.setState({ ...this.workplace, fastTrackPayByJobRolesViewed: true });
    });
  }

  private convertJobRoleNameToId(queryParams: QueryParamsForBackend): QueryParamsForWorkerWithPayData {
    if (!queryParams.searchTerm) {
      return queryParams;
    }

    const jobRoleTitle = queryParams.searchTerm;
    const matchedJob = this.allJobs.find((job) => job.title === jobRoleTitle);

    if (!matchedJob) {
      return queryParams;
    }

    return {
      ...lodash.omit(queryParams, 'searchTerm'),
      jobId: matchedJob.id,
    };
  }

  public getPageOfWorkers(searchEvent: SearchEvent): void {
    const searchParams = this.convertJobRoleNameToId(parseSearchEvent(searchEvent));

    const getWorker = this.workerService
      .getWorkersWithPayData(this.workplaceUid, searchParams)
      .pipe(take(1))
      .subscribe((response) => {
        this.setNewWorkers(response.workers);
        this.currentWorkerCount = response.count;
      });

    this.subscriptions.add(getWorker);
  }

  private setNewWorkers(workers: WorkerWithPayData[]) {
    this.workersToShow = workers;
    this.addWorkersToForm(workers);
  }

  public buildJobDataProvider() {
    const allJobsTitles = this.allJobs.map((job) => job.title);
    const dataProvider: AutoSuggestDataProvider = (searchTerm: string) => {
      if (!searchTerm) {
        return [];
      }

      const searchTermInLowerCase = searchTerm.trim().toLowerCase();

      const suggestedJobs = allJobsTitles.filter((jobTitle) => {
        return jobTitle && jobTitle.toLowerCase().includes(searchTermInLowerCase);
      }) as string[];

      const matchStartComeFirst = (jobTitle: string) =>
        jobTitle && jobTitle.toLowerCase().startsWith(searchTermInLowerCase) ? 1 : 2;

      const suggestionsWithUpdateOrders = lodash.sortBy(suggestedJobs, [matchStartComeFirst, lodash.identity]);

      return suggestionsWithUpdateOrders;
    };

    this.jobRoleDataProvider.set(dataProvider);
  }

  private getUpdatedPayData() {
    const touchedFormControls = Object.entries(this.workersFormGroup.controls).filter(([_workerUid, control]) => {
      return control.dirty;
    });
    const updates = touchedFormControls.map(([workerUid, control]) => {
      const { payValue, payRate } = control.value;
      return { uid: workerUid, annualHourlyPay: { value: payValue, rate: payRate } };
    });

    return updates;
  }

  public onSubmit(): void {
    const updatedPayData = this.getUpdatedPayData();
    if (!updatedPayData?.length) {
      this.returnToStaffRecordsPage();
      return;
    }

    const alertMessage = `Pay updated in ${updatedPayData.length} staff record${updatedPayData.length > 1 ? 's' : ''}`;

    const submitCall = this.establishmentService.updateWorkers(this.workplaceUid, updatedPayData).subscribe(() => {
      this.returnToStaffRecordsPage().then(() => {
        this.alertService.addAlert({ type: 'success', message: alertMessage });
      });
    });

    this.subscriptions.add(submitCall);
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.returnToStaffRecordsPage();
  }

  private returnToStaffRecordsPage(): Promise<boolean> {
    return this.router.navigate(['/dashboard'], { fragment: 'staff-records' });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
