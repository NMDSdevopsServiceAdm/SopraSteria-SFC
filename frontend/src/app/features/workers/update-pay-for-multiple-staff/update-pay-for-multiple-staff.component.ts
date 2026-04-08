import lodash from 'lodash';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { Component, signal, viewChild, WritableSignal } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Establishment,
  SortStaffOptionsForUpdatePay,
  StaffSummarySortByParamMap,
} from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { parseSearchEventForWorkerWithPayData, SearchEvent } from '@core/model/pagination.model';
import { WorkerWithPayData } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { JobRoleDataProvider } from '@shared/auto-suggest.model';
import { NewTablePaginationWrapperComponent } from '@shared/components/table-pagination-wrapper-new/new-table-pagination-wrapper.component';

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
  public paginationWrapper = viewChild.required<NewTablePaginationWrapperComponent>('paginationWrapper');

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
  public jobRoleDataProvider: WritableSignal<JobRoleDataProvider> = signal(null);
  public showNewPillForFastTrackLink: boolean = true;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: UntypedFormBuilder,
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

    this.allJobs = this.route.snapshot.data.jobs;
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
        filter((newValue) => newValue !== ''),
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
    const data = {
      property: 'fastTrackPayByJobRolesViewed',
      value: true,
    };

    this.router
      .navigate(['../fast-track-pay-updates'], { relativeTo: this.route })
      .then(() => this.setFastTrackPayByJobRolesViewed());
  }

  private setFastTrackPayByJobRolesViewed(): void {
    const data = {
      property: 'fastTrackPayByJobRolesViewed',
      value: true,
    };

    this.subscriptions.add(
      this.establishmentService.updateSingleEstablishmentField(this.workplaceUid, data).subscribe(),
    );
  }

  public getPageOfWorkers(event: SearchEvent): void {
    const searchParams = parseSearchEventForWorkerWithPayData(event);

    this.workerService
      .getWorkersWithPayData(this.workplaceUid, searchParams)
      .pipe(take(1))
      .subscribe((response) => {
        this.setNewWorkers(response.workers);
        this.currentWorkerCount = response.count;
      });
  }

  private setNewWorkers(workers: WorkerWithPayData[]) {
    this.workersToShow = workers;
    this.addWorkersToForm(workers);
  }

  public buildJobDataProvider() {
    const allJobs = [...this.allJobs];
    const dataProvider: JobRoleDataProvider = (searchTerm: string) => {
      if (!searchTerm) {
        return [];
      }

      const searchTermInLowerCase = searchTerm.trim().toLowerCase();

      const matchedJobs = allJobs.filter((job) => {
        return job.title && job.title.toLowerCase().includes(searchTermInLowerCase);
      });

      const resultsMatchTheStartComeFirst = (job: Job) =>
        job.title && job.title.toLowerCase().startsWith(searchTermInLowerCase) ? 1 : 2;
      const matchesWithUpdateOrders = lodash.sortBy(matchedJobs, [resultsMatchTheStartComeFirst, 'title']);

      return matchesWithUpdateOrders.map((job) => {
        return { suggestion: job.title, dataValue: job };
      });
    };

    this.jobRoleDataProvider.set(dataProvider);
  }
}
