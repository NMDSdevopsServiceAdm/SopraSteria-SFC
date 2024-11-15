import { Directive, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';
import { Job, JobGroup } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { Question } from '@features/workplace/question/question.component';
import { AccordionGroupComponent } from '@shared/components/accordions/generic-accordion/accordion-group/accordion-group.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Directive()
export class JobRoleSelectionDirective extends Question implements OnInit, OnDestroy {
  @ViewChild('accordion') accordion: AccordionGroupComponent;
  public section = 'Vacancies and turnover';
  public heading: string;
  public errorMessageOnEmptyInput: string;
  public jobIdOfOtherCareProvidingRole = 20;
  public jobGroupsToOpenAtStart: string[] = [];
  public jobGroups: JobGroup[] = [];

  protected localStorageKey: string;
  protected jobsAvailable: Job[] = [];
  protected prefillData: Array<Vacancy | Starter | Leaver>;
  protected prefilledJobIds: number[] = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
  }

  protected init() {
    this.getJobs();
    this.setupRoutes();
    this.setupForm();
    this.prefill();
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  protected setupRoutes(): void {}

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[], CustomValidators.validateArrayNotEmpty()],
      otherCareProvidingRoleName: ['', null],
    });
  }

  protected prefill(): void {
    this.getPrefillData();
    if (!this.prefillData || !this.prefillData?.length) {
      return;
    }

    this.prefilledJobIds = this.prefillData.map((job) => Number(job.jobId));
    this.jobGroupsToOpenAtStart = this.jobGroups
      .filter((group) => group.items.some((job) => this.prefilledJobIds.includes(job.id)))
      .map((group) => group.title);

    const otherCareProvidingRole = this.prefillData.find((job) => job.jobId === this.jobIdOfOtherCareProvidingRole);
    this.form.patchValue({
      selectedJobRoles: this.prefilledJobIds,
      otherCareProvidingRoleName: otherCareProvidingRole?.other ?? null,
    });
  }
  protected getPrefillData(): void {}

  public onCheckboxClick(target: HTMLInputElement) {
    const jobId = Number(target.value);
    const selectedJobRoles = this.form.get('selectedJobRoles');
    const currentSelectedIds: number[] = selectedJobRoles.value;

    if (currentSelectedIds.includes(jobId)) {
      const updatedSelection = currentSelectedIds.filter((id) => id !== jobId);
      selectedJobRoles.setValue(updatedSelection);
    } else {
      selectedJobRoles.setValue([...currentSelectedIds, jobId]);
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.accordion.showAll();
    }
    super.onSubmit();
  }

  protected onSuccess(): void {}

  protected saveToLocal(dataToStore) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(dataToStore));
  }

  protected loadFromLocal() {
    try {
      return JSON.parse(localStorage.getItem(this.localStorageKey));
    } catch (err) {
      return null;
    }
  }

  protected setupFormErrorsMap(): void {
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

  protected generateUpdateProps() {
    // suppress the default action of making calls to backend
    return null;
  }
}
