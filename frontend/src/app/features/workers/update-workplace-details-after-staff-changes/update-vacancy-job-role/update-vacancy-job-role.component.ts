import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Job, JobGroup } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { JobService } from '@core/services/job.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { UpdateWorkplaceAfterStaffChangesService } from '../../../../core/services/update-workplace-after-staff-changes.service';
import { Leaver, Starter, Vacancy } from '@core/model/establishment.model';

@Component({
  selector: 'app-update-vacancy-job-role',
  templateUrl: './update-vacancy-job-role.component.html',
  styleUrl: './update-vacancy-job-role.component.scss',
})
export class UpdateVacancyJobRoleComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public heading = 'Select job roles for the vacancies you want to add';
  public form: UntypedFormGroup;
  public submitted = false;
  public jobGroups: JobGroup[] = [];
  public jobsAvailable: Job[] = [];
  public disabledJobIds: number[] = [];
  protected prefillData: Array<Vacancy | Starter | Leaver>;
  protected selectedJobIds: number[] = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected updateWorkplaceAfterStaffChangesService: UpdateWorkplaceAfterStaffChangesService,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.getJobs();
    this.setupForm();
    this.prefill();
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  protected prefill(): void {
    this.prefillData = this.updateWorkplaceAfterStaffChangesService.selectedVacancies;
    this.disabledJobIds = this.prefillData.map((vacancy) => vacancy.jobId) ?? [];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[], { validators: CustomValidators.validateArrayNotEmpty(), updateOn: 'submit' }],
    });
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
      this.errorSummaryService.scrollToErrorSummary();
      return;
    }

    const jobIdsToAdd = this.form.get('selectedJobRoles').value;
    const jobRolesToAdd: Vacancy[] = this.jobsAvailable
      .filter((job) => jobIdsToAdd.includes(job.id))
      .map((job) => {
        return { jobId: job.id, title: job.title, total: 1 };
      });
    const preselectedJobs = this.updateWorkplaceAfterStaffChangesService.selectedVacancies;
    this.updateWorkplaceAfterStaffChangesService.selectedVacancies = [...preselectedJobs, ...jobRolesToAdd];
  }

  public onCancel(event: Event): void {
    event.preventDefault();
  }
}
