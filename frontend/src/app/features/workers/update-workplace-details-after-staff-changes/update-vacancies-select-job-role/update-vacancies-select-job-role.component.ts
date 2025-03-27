import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';
import { Job, JobGroup } from '@core/model/job.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { JobService } from '@core/services/job.service';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { AccordionGroupComponent } from '@shared/components/accordions/generic-accordion/accordion-group/accordion-group.component';
import { CustomValidators } from '@shared/validators/custom-form-validators';

@Component({
  selector: 'app-update-vacancies-select-job-role',
  templateUrl: './update-vacancies-select-job-role.component.html',
})
export class UpdateVacanciesSelectJobRoleComponent implements OnInit, AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  @ViewChild('accordion') accordion: AccordionGroupComponent;

  public jobRoleType = 'vacancies';
  public errorMessageOnEmptyInput = `Select job roles for the ${this.jobRoleType} you want to add`;

  public form: UntypedFormGroup;
  public formErrorsMap: Array<ErrorDetails> = [];
  public submitted = false;

  public jobGroups: JobGroup[] = [];
  public jobsAvailable: Job[] = [];
  public disabledJobIds: number[] = [];
  protected prefillData: Array<Vacancy | Starter | Leaver> = [];
  protected selectedJobIds: number[] = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backlinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.getJobs();
    this.setupForm();
    this.setupFormErrorsMap();
    this.setBackLink();
    this.prefill();
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  protected setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[], { validators: CustomValidators.validateArrayNotEmpty(), updateOn: 'submit' }],
    });
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

  protected setBackLink() {
    this.backlinkService.showBackLink();
  }

  protected prefill(): void {
    this.prefillData = this.updateWorkplaceAfterStaffChangesService.selectedVacancies;
    this.disabledJobIds = this.prefillData.map((jobRole) => jobRole.jobId) ?? [];
  }

  ngAfterViewInit() {
    this.errorSummaryService.formEl$.next(this.formEl);
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
    this.form.patchValue({ selectedJobRoles: this.selectedJobIds });

    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (!this.form.valid) {
      this.accordion.showAll();
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    this.onSuccess();
  }

  private onSuccess(): void {
    this.storeUpdatedJobRoles();
    this.returnToPreviousPage();
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.returnToPreviousPage();
  }

  protected storeUpdatedJobRoles(): void {
    const updatedJobRoles = this.getUpdatedJobRoles();
    this.updateWorkplaceAfterStaffChangesService.selectedVacancies = updatedJobRoles;
  }

  private getUpdatedJobRoles(): Array<Vacancy | Starter | Leaver> {
    const selectedJobIds = this.form.get('selectedJobRoles').value;
    const jobRolesToAdd: Vacancy[] = this.jobsAvailable
      .filter((job) => selectedJobIds.includes(job.id))
      .map((job) => {
        return { jobId: job.id, title: job.title, total: 1 };
      });
    const jobRolesSelectedBefore = this.prefillData;
    return [...jobRolesSelectedBefore, ...jobRolesToAdd];
  }

  protected returnToPreviousPage(): void {
    this.router.navigate(['../update-vacancies'], { relativeTo: this.route });
  }
}
