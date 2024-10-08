import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, mandatoryTrainingJobOption } from '@core/model/establishment.model';
import { Job } from '@core/model/job.model';
import { allMandatoryTrainingCategories, TrainingCategory } from '@core/model/training.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';

@Component({
  selector: 'app-add-mandatory-training',
  templateUrl: './add-mandatory-training.component.html',
})
export class AddMandatoryTrainingComponent implements OnInit, OnDestroy {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public renderAsEditMandatoryTraining: boolean;
  public submitted = false;
  public preExistingTraining: any;
  public categories: TrainingCategory[];
  public filteredTrainingCategories: TrainingCategory[];
  private subscriptions: Subscription = new Subscription();
  public jobs: Job[] = [];
  public allJobsLength: Number;
  public previousAllJobsLength = [29, 31, 32];
  public hasDuplicateJobRoles: boolean;
  public filteredJobs: Array<Job[]> = [];
  public trainings: TrainingCategory[] = [];
  public establishment: Establishment;
  public primaryWorkplace: Establishment;
  public formErrorsMap: Array<ErrorDetails> = [];
  public serverError: string;
  public serverErrorsMap: Array<ErrorDefinition> = [];
  public return: URLStructure;
  public existingMandatoryTrainings: allMandatoryTrainingCategories;
  public allOrSelectedJobRoleOptions = [
    {
      label: 'All job roles',
      value: mandatoryTrainingJobOption.all,
    },
    {
      label: `Only selected job roles`,
      value: mandatoryTrainingJobOption.selected,
    },
  ];
  constructor(
    protected backLinkService: BackLinkService,
    private trainingService: TrainingService,
    private trainingCategoryService: TrainingCategoryService,
    protected formBuilder: UntypedFormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private jobService: JobService,
    protected router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
  ) {}

  get selectedJobRolesArray(): UntypedFormArray {
    return this.form.get('selectedJobRoles') as UntypedFormArray;
  }

  ngOnInit(): void {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.establishment = this.route.snapshot.parent.data.establishment;

    this.renderAsEditMandatoryTraining = this.route.snapshot.url[0].path === 'edit-mandatory-training';
    this.return = { url: ['/workplace', this.establishment.uid, 'add-and-manage-mandatory-training'] };

    this.getAllJobs();
    this.setUpForm();
    this.setupServerErrorsMap();
    this.backLinkService.showBackLink();

    this.subscriptions.add(
      this.trainingService.getAllMandatoryTrainings(this.establishment.uid).subscribe((existingMandatoryTraining) => {
        this.existingMandatoryTrainings = existingMandatoryTraining;
        this.getAllTrainingCategories();
      }),
    );
  }

  private getAllTrainingCategories(): void {
    this.subscriptions.add(
      this.trainingCategoryService
        .getCategories()
        .pipe(take(1))
        .subscribe((trainings) => {
          this.trainings = this.filterTrainingCategories(trainings);
          if (this.renderAsEditMandatoryTraining) {
            this.prefill();
            this.updateMandatoryTrainingWithPreviousAllJobsRecordLength();
          }
        }),
    );
  }

  public filterTrainingCategories(trainings): TrainingCategory[] {
    const preSelectedIds = this.existingMandatoryTrainings.mandatoryTraining.map(
      (existingMandatoryTrainings) => existingMandatoryTrainings.trainingCategoryId,
    );
    if (this.renderAsEditMandatoryTraining) {
      this.preExistingTraining = this.existingMandatoryTrainings.mandatoryTraining.find((mandatoryTrainingObject) => {
        return mandatoryTrainingObject.trainingCategoryId === parseInt(this.route.snapshot.parent.url[0].path, 10);
      });

      return trainings.filter((training) => {
        return this.preExistingTraining.trainingCategoryId === training.id || !preSelectedIds.includes(training.id);
      });
    } else {
      return trainings.filter((training) => {
        return !preSelectedIds.includes(training.id);
      });
    }
  }

  private getAllJobs(): void {
    this.subscriptions.add(
      this.jobService
        .getJobs()
        .pipe(take(1))
        .subscribe((jobs) => {
          this.allJobsLength = jobs.length;
          this.jobs = jobs;
        }),
    );
  }

  private setUpForm(trainingId = null): void {
    this.form = this.formBuilder.group({
      trainingCategory: [trainingId, [Validators.required]],
      allOrSelectedJobRoles: [null, [Validators.required]],
      selectedJobRoles: this.formBuilder.array([]),
    });
  }

  private setupServerErrorsMap(): void {
    const serverErrorMessage = 'There has been a problem saving your mandatory training. Please try again.';
    this.serverErrorsMap = [
      {
        name: 500,
        message: serverErrorMessage,
      },
      {
        name: 400,
        message: serverErrorMessage,
      },
      {
        name: 404,
        message: serverErrorMessage,
      },
    ];
  }

  protected setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'trainingCategory',
        type: [
          {
            name: 'required',
            message: 'Select the training category you want to be mandatory',
          },
        ],
      },
      {
        item: 'allOrSelectedJobRoles',
        type: [
          {
            name: 'required',
            message: 'Select which job roles need this training',
          },
        ],
      },
    ];
    this.selectedJobRolesArray.controls.forEach((_, index) => {
      this.formErrorsMap.push({
        item: `selectedJobRoles.id.${index}`,
        type: [
          {
            name: 'required',
            message: `Select the job role (job role ${index + 1})`,
          },
        ],
      });
    });
  }

  public checkDuplicateJobRoles(preExistingTrainingJobsDuplicates): boolean {
    for (let i = 0; i < preExistingTrainingJobsDuplicates.length; i++) {
      for (let j = i + 1; j < preExistingTrainingJobsDuplicates.length; j++) {
        if (preExistingTrainingJobsDuplicates[i].id === preExistingTrainingJobsDuplicates[j].id) {
          return true;
        }
      }
    }
  }

  public filterPreExistingTrainingJobsDuplicates(preExistingTrainingJobs) {
    if (preExistingTrainingJobs > 1) {
      let filtered = preExistingTrainingJobs.filter(
        (obj1, index, arr) =>
          arr.findIndex((obj2) => {
            obj2.id === obj1.id;
          }) === index,
      );
      return filtered;
    } else {
      return preExistingTrainingJobs;
    }
  }

  public prefill(): void {
    this.form.patchValue({
      trainingCategory: this.preExistingTraining.trainingCategoryId,
      allOrSelectedJobRoles:
        this.preExistingTraining.jobs.length === this.allJobsLength ||
        (this.previousAllJobsLength.includes(this.preExistingTraining.jobs.length) &&
          this.checkDuplicateJobRoles(this.preExistingTraining.jobs))
          ? mandatoryTrainingJobOption.all
          : mandatoryTrainingJobOption.selected,
      selectedJobRoles: this.prefillJobRoles(),
    });
  }

  protected prefillJobRoles() {
    let filteredPreExistingTrainingJobs = this.filterPreExistingTrainingJobsDuplicates(this.preExistingTraining.jobs);
    return this.preExistingTraining.jobs.length === this.allJobsLength ||
      (this.previousAllJobsLength.includes(this.preExistingTraining.jobs.length) &&
        this.checkDuplicateJobRoles(this.preExistingTraining.jobs))
      ? null
      : filteredPreExistingTrainingJobs.forEach((job) => {
          this.selectedJobRolesArray.push(this.createVacancyControl(job.id));
        });
  }

  public addVacancy(): void {
    this.selectedJobRolesArray.push(this.createVacancyControl());
    this.setupFormErrorsMap();
  }

  public filterJobList(jobIndex): Job[] {
    return this.jobs.filter(
      (job) =>
        !this.selectedJobRolesArray.controls.some(
          (jobRole) =>
            jobRole !== this.selectedJobRolesArray.controls[jobIndex] &&
            parseInt(jobRole.get('id').value, 10) === job.id,
        ),
    );
  }

  public removeVacancy(event: Event, jobIndex): void {
    event.preventDefault();
    this.selectedJobRolesArray.removeAt(jobIndex);
  }

  private createVacancyControl(jobId = null): UntypedFormGroup {
    return this.formBuilder.group({
      id: [jobId, [Validators.required]],
    });
  }

  protected generateUpdateProps(): any {
    return {
      previousTrainingCategoryId: this.preExistingTraining?.trainingCategoryId,
      trainingCategoryId: parseInt(this.form.get('trainingCategory').value, 10),
      allJobRoles: this.form.get('allOrSelectedJobRoles').value === mandatoryTrainingJobOption.all ? true : false,
      jobs: this.form.get('selectedJobRoles').value,
    };
  }

  protected createAndUpdateMandatoryTraining(props): void {
    this.subscriptions.add(
      this.establishmentService.createAndUpdateMandatoryTraining(this.establishment.uid, props).subscribe(
        () => {
          this.router.navigate(['/workplace', this.establishment.uid, 'add-and-manage-mandatory-training']);
          this.alertService.addAlert({
            type: 'success',
            message: this.renderAsEditMandatoryTraining
              ? 'Mandatory training category updated'
              : 'Mandatory training category added',
          });
        },
        (error) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
        },
      ),
    );
  }

  public onVacancyTypeSelectionChange(): void {
    const allOrSelectedJobRoles = this.form.get('allOrSelectedJobRoles').value;
    if (allOrSelectedJobRoles === mandatoryTrainingJobOption.all) {
      while (this.selectedJobRolesArray.length > 0) {
        this.selectedJobRolesArray.removeAt(0);
      }
      this.selectedJobRolesArray.reset([], { emitEvent: false });
    } else if (this.renderAsEditMandatoryTraining) {
      this.preExistingTraining.jobs.length === this.allJobsLength ||
      (this.previousAllJobsLength.includes(this.preExistingTraining.jobs.length) &&
        this.checkDuplicateJobRoles(this.preExistingTraining.jobs))
        ? this.addVacancy()
        : this.prefillJobRoles();
    } else {
      this.addVacancy();
    }
  }

  public updateMandatoryTrainingWithPreviousAllJobsRecordLength(): void {
    const props = this.generateUpdateProps();

    if (
      this.previousAllJobsLength.includes(this.preExistingTraining.jobs.length) &&
      this.checkDuplicateJobRoles(this.preExistingTraining.jobs)
    ) {
      this.subscriptions.add(
        this.establishmentService.createAndUpdateMandatoryTraining(this.establishment.uid, props).subscribe(
          () => {},
          (error) => {
            console.error(error.error.message);
          },
        ),
      );
    }
  }

  public onSubmit(): void {
    this.submitted = true;
    this.setupFormErrorsMap();

    if (!this.form.valid) {
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }
    const props = this.generateUpdateProps();
    this.createAndUpdateMandatoryTraining(props);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
