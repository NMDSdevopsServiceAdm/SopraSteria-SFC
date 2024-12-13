import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Job, JobGroup } from '@core/model/job.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { JobService } from '@core/services/job.service';
import { TrainingService } from '@core/services/training.service';
import { AccordionGroupComponent } from '@shared/components/accordions/generic-accordion/accordion-group/accordion-group.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Component({
  selector: 'app-select-job-roles-mandatory',
  templateUrl: './select-job-roles-mandatory.component.html',
})
export class SelectJobRolesMandatoryComponent {
  constructor(
    private formBuilder: UntypedFormBuilder,
    private trainingService: TrainingService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private backLinkService: BackLinkService,
    private alertService: AlertService,
    public route: ActivatedRoute,
  ) {}

  @ViewChild('accordion') accordion: AccordionGroupComponent;
  @ViewChild('formEl') formEl: ElementRef;

  public form: UntypedFormGroup;
  public jobGroups: JobGroup[] = [];
  public jobsAvailable: Job[] = [];
  public submitted: boolean;
  public selectedJobIds: number[] = [];
  public errorMessageOnEmptyInput: string = 'Select the job roles that need this training';
  public formErrorsMap: Array<ErrorDetails> = [];

  ngOnInit(): void {
    this.getJobs();
    this.setupForm();
    this.backLinkService.showBackLink();
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[], { validators: CustomValidators.validateArrayNotEmpty(), updateOn: 'submit' }],
    });

    this.formErrorsMap = [
      {
        item: 'selectedJobRoles',
        type: [
          {
            name: 'selectedNone',
            message: this.errorMessageOnEmptyInput,
          },
        ],
      },
    ];
  }

  public onCheckboxClick(target: HTMLInputElement) {
    const jobId = Number(target.value);

    if (this.selectedJobIds.includes(jobId)) {
      this.selectedJobIds = this.selectedJobIds.filter((id) => id !== jobId);
    } else {
      this.selectedJobIds = [...this.selectedJobIds, jobId];
    }
  }

  public onSubmit(): void {
    this.submitted = true;

    this.form.get('selectedJobRoles').setValue(this.selectedJobIds);

    if (this.form.invalid) {
      this.accordion.showAll();
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    this.navigateBackToAddMandatoryTrainingPage();
    this.alertService.addAlert({
      type: 'success',
      message: 'Mandatory training category added',
    });
    this.trainingService.resetState();
  }

  public onCancel(event: Event): void {
    event.preventDefault();

    this.trainingService.resetState();
    this.navigateBackToAddMandatoryTrainingPage();
  }

  private navigateBackToAddMandatoryTrainingPage(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
  }
}
