import { Directive, ViewChild } from '@angular/core';
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
export class SelectJobRolesDirective extends Question {
  @ViewChild('accordion') accordion: AccordionGroupComponent;
  public section = 'Vacancies and turnover';
  public heading: string;
  public errorMessageOnEmptyInput: string;
  public jobIdOfOtherCareProvidingRole = 20;
  public jobGroupsToOpenAtStart: string[] = [];
  public jobGroups: JobGroup[] = [];

  protected field: string;
  protected numbersField: string;
  protected hasStartersLeaversVacanciesField: string;
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

  protected setupRoutes(): void {
    this.nextRoute = ['/workplace', this.establishment.uid, `how-many-${this.field}`];
    this.previousRoute = ['/workplace', this.establishment.uid, `do-you-have-${this.field}`];
  }

  public setBackLink() {
    this.back = { url: this.previousRoute };
    this.backService.setBackLink(this.back);
  }

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

  protected getPrefillData(): void {
    const previousData = this.loadFromLocal();
    if (previousData?.establishmentUid === this.establishment.uid && Array.isArray(previousData?.[this.field])) {
      this.prefillData = previousData[this.field];
    } else if (Array.isArray(this.establishment[this.field])) {
      this.prefillData = this.establishment[this.field] as Array<Vacancy | Starter | Leaver>;
    }
  }

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

    if (!this.submitAction.save) {
      this.clearLocalStorageData();
    }

    super.onSubmit();
  }

  protected clearLocalStorageData(): void {
    localStorage.removeItem(this.hasStartersLeaversVacanciesField);
    localStorage.removeItem(this.numbersField);
  }

  protected saveToLocal(dataToStore) {
    localStorage.setItem(this.numbersField, JSON.stringify(dataToStore));
  }

  protected loadFromLocal() {
    try {
      return JSON.parse(localStorage.getItem(this.numbersField));
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

  protected onSuccess(): void {
    const selectedJobIds: number[] = this.form.get('selectedJobRoles').value;
    const otherCareProvidingRoleName: string = this.form.get('otherCareProvidingRoleName').value;
    const fieldFromDatabase = Array.isArray(this.establishment[this.field]) ? this.establishment[this.field] : [];

    const updatedField: Vacancy | Starter | Leaver[] = selectedJobIds.map((jobId) => {
      const job = this.jobsAvailable.find((job) => job.id === jobId);
      const fieldCount = fieldFromDatabase.find((field) => field.jobId === jobId)?.total ?? null;

      if (job.id === this.jobIdOfOtherCareProvidingRole && otherCareProvidingRoleName) {
        return { jobId, title: job.title, total: fieldCount, other: otherCareProvidingRoleName };
      }

      return { jobId, title: job.title, total: fieldCount };
    });
    const dataToStore = { establishmentUid: this.establishment.uid, [this.field]: updatedField };
    this.saveToLocal(dataToStore);
  }
}
