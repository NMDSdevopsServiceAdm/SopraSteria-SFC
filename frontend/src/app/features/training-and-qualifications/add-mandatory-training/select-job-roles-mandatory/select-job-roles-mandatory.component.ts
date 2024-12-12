import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Job, JobGroup } from '@core/model/job.model';
import { JobService } from '@core/services/job.service';
import { TrainingService } from '@core/services/training.service';
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
    public route: ActivatedRoute,
  ) {}

  public form: UntypedFormGroup;
  public jobGroups: JobGroup[] = [];
  public jobsAvailable: Job[] = [];
  public submitted: boolean;
  public selectedJobIds: number[] = [];

  ngOnInit(): void {
    this.getJobs();
    this.setupForm();
  }

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.jobGroups = JobService.sortJobsByJobGroup(this.jobsAvailable);
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

  public onCancel(event: Event): void {
    event.preventDefault();

    this.trainingService.resetState();
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
