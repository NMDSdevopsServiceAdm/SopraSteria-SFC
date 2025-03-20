import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Job, JobGroup } from '@core/model/job.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { JobService } from '@core/services/job.service';
import { CustomValidators } from '@shared/validators/custom-form-validators';
import { UpdateWorkplaceAfterStaffChangesService } from '../../../../core/services/update-workplace-after-staff-changes.service';

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
  public preselectedJobIds: number[] = [];

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
    this.getPreselectedJobIds();
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
  }

  protected getPreselectedJobIds(): void {
    const jobIdsFromService = this.updateWorkplaceAfterStaffChangesService.selectedVacancies?.map(
      (vacancy) => vacancy.jobId,
    );
    this.preselectedJobIds = jobIdsFromService ?? [];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[], { validators: CustomValidators.validateArrayNotEmpty(), updateOn: 'submit' }],
    });
  }

  public onSubmit(): void {}
}
