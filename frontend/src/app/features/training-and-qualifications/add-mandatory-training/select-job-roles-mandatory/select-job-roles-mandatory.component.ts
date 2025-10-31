import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, mandatoryTraining } from '@core/model/establishment.model';
import { Job, JobGroup } from '@core/model/job.model';
import { SelectedTraining } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { MandatoryTrainingService } from '@core/services/training.service';
import { AccordionGroupComponent } from '@shared/components/accordions/generic-accordion/accordion-group/accordion-group.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-job-roles-mandatory',
  templateUrl: './select-job-roles-mandatory.component.html',
  standalone: false,
})
export class SelectJobRolesMandatoryComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    private formBuilder: UntypedFormBuilder,
    private trainingService: MandatoryTrainingService,
    private router: Router,
    private errorSummaryService: ErrorSummaryService,
    private backLinkService: BackLinkService,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
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
  public serverError: string;
  public subscriptions: Subscription = new Subscription();
  private establishment: Establishment;
  private selectedTrainingCategory: SelectedTraining;
  private mandatoryTrainingBeingEdited: mandatoryTraining;
  public jobGroupsToOpenAtStart: string[] = [];

  ngOnInit(): void {
    this.selectedTrainingCategory = this.trainingService.selectedTraining;
    this.establishment = this.route.snapshot.data?.establishment;

    if (!this.selectedTrainingCategory) {
      this.router.navigate(['../select-training-category'], { relativeTo: this.route });
    }

    this.backLinkService.showBackLink();
    this.getJobs();
    this.setupForm();
    this.mandatoryTrainingBeingEdited = this.trainingService.mandatoryTrainingBeingEdited;

    if (this.mandatoryTrainingBeingEdited) {
      this.prefillForm();
    }
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

    this.createMandatoryTraining();
  }

  private createMandatoryTraining(): void {
    const props = this.generateUpdateProps();

    this.subscriptions.add(
      this.establishmentService.createAndUpdateMandatoryTraining(this.establishment.uid, props).subscribe(
        () => {
          this.trainingService.resetState();

          this.navigateBackToAddMandatoryTrainingPage().then(() => {
            this.alertService.addAlert({
              type: 'success',
              message: `Mandatory training category ${this.mandatoryTrainingBeingEdited ? 'updated' : 'added'}`,
            });
          });
        },
        () => {
          this.serverError = 'There has been a problem saving your mandatory training. Please try again.';
        },
      ),
    );
  }

  private generateUpdateProps(): mandatoryTraining {
    const props: mandatoryTraining = {
      trainingCategoryId: this.selectedTrainingCategory.trainingCategory.id,
      allJobRoles: false,
      jobs: this.selectedJobIds.map((id) => {
        return { id };
      }),
    };

    if (this.mandatoryTrainingBeingEdited?.trainingCategoryId) {
      props.previousTrainingCategoryId = this.mandatoryTrainingBeingEdited.trainingCategoryId;
    }

    return props;
  }

  private prefillForm(): void {
    if (this.mandatoryTrainingBeingEdited.jobs?.length == this.trainingService.allJobRolesCount) return;

    this.selectedJobIds = this.mandatoryTrainingBeingEdited.jobs.map((job) => Number(job.id));
    this.jobGroupsToOpenAtStart = this.jobGroups
      .filter((group) => group.items.some((job) => this.selectedJobIds.includes(job.id)))
      .map((group) => group.title);

    this.form.patchValue({
      selectedJobRoles: this.selectedJobIds,
    });
  }

  public onCancel(event: Event): void {
    event.preventDefault();

    this.trainingService.resetState();
    this.navigateBackToAddMandatoryTrainingPage();
  }

  private navigateBackToAddMandatoryTrainingPage(): Promise<boolean> {
    return this.router.navigate(['../'], { relativeTo: this.route });
  }

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
