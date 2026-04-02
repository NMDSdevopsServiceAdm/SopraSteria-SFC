import { Component } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

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
  public allJobTitles: Array<string>;
  public allJobTitlesLowerCase: Array<string>;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private establishmentService: EstablishmentService,
    private workerService: WorkerService,
    private backLinkService: BackLinkService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {
    this.getSuggestedList = this.getSuggestedList.bind(this);
  }

  ngOnInit() {
    const firstPageWorkers = this.route.snapshot.data.workersWithPayData?.workers ?? [];
    this.workplace = this.establishmentService.establishment;
    this.workplaceUid = this.workplace.uid;

    const totalWorkerCount = this.route.snapshot.data.workersWithPayData?.count;
    this.currentWorkerCount = totalWorkerCount;
    this.totalWorkerCount = totalWorkerCount;

    this.allJobs = this.route.snapshot.data.jobs;
    this.allJobTitles = this.allJobs.map((job) => job.title);
    this.allJobTitlesLowerCase = this.allJobTitles.map((title) => title.toLowerCase());

    this.workersToShow = firstPageWorkers;
    this.setupForm();
    this.addWorkersToForm(this.workersToShow);
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
    const workersFormGroup = this.form.get('workers') as FormGroup;

    workers.forEach((worker) => {
      workersFormGroup.addControl(worker.uid, this.buildFormControlsForWorker(worker));
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

    const clearNotKnownWhenTypeInPayRate = payRate.valueChanges
      .pipe(
        filter((newValue) => newValue !== ''),
        filter(() => payValue.value === DontKnow),
      )
      .subscribe(() => {
        payValue.setValue(null, { emitEvent: false });
      });

    this.subscriptions.add(clearPayRateWhenSelectNotKnown);
    this.subscriptions.add(clearNotKnownWhenTypeInPayRate);

    return workerFormControls;
  }

  public handleClickForFastTrackPageLink(): void {
    this.router.navigate(['../fast-track-pay-updates'], { relativeTo: this.route });
  }

  public getPageOfWorkers(event: SearchEvent): void {
    const searchParams = parseSearchEventForWorkerWithPayData(event);

    this.workerService
      .getWorkersWithPayData(this.workplaceUid, searchParams)
      .pipe(take(1))
      .subscribe((response) => {
        this.setNewWorkers(response.workers);
      });
  }

  private setNewWorkers(workers: WorkerWithPayData[]) {
    this.workersToShow = workers;
    this.addWorkersToForm(workers);
  }

  public getSuggestedList(): string[] {
    const { jobRoleToSearch } = this.form.value;
    const isValidString = typeof jobRoleToSearch === 'string';
    if (!isValidString! || jobRoleToSearch?.length < 2) {
      return [];
    }

    const searchTerm = jobRoleToSearch.trim().toLowerCase();
    const matches = this.allJobTitles.filter((jobTitle) => jobTitle.includes(searchTerm));

    return matches;
  }

  public handleSearchBoxClick(selectedJobTitle: string): void {
    console.log('==== here ====');
    const selectedJob = this.allJobs.find((job) => job.title === selectedJobTitle);
    console.log(selectedJobTitle, '<---selectedJobTitle');
    console.log(selectedJob, '<---selectedJob');
    if (!selectedJob) {
      return;
    }

    const searchEvent = {
      index: 0,
      itemsPerPage: 15,
      searchTerm: selectedJob.id.toString(),
      sortByValue: 'staffNameAsc',
    } as SearchEvent;

    this.getPageOfWorkers(searchEvent);
  }
}
