import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Question } from '../question/question.component';
import { UntypedFormBuilder, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Job, JobGroup } from '@core/model/job.model';
import { AccordionGroupComponent } from '@shared/components/accordions/generic-accordion/accordion-group/accordion-group.component';
import { Vacancy } from '@core/model/establishment.model';

@Component({
  selector: 'app-vacancies-job-roles-selection',
  templateUrl: './vacancies-job-roles-selection.component.html',
})
export class VacanciesJobRolesSelectionComponent extends Question implements OnInit, OnDestroy {
  @ViewChild('accordion') accordion: AccordionGroupComponent;
  public section = 'Vacancies and turnover';
  public jobsAvailable: Job[] = [];
  public jobGroups: JobGroup[] = [];
  public errorMessageOnEmptyInput = 'Select job roles for all your current staff vacancies';
  private vacancies: Vacancy[] = [];
  private prefilledJobIds: number[] = [];
  private summaryText = {
    'Care providing roles': 'care worker, community support, support worker',
    'Professional and related roles': 'occupational therapist, registered nurse, nursing assistant',
    'Managerial and supervisory roles': 'registered manager, supervisor, team leader',
    'IT, digital and data roles': 'data analyst, IT and digital support, IT manager',
    'Other roles': 'admin, care co-ordinator, learning and development',
  };

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
    this.setupForm();
    this.prefill();

    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'vacancies-number'];
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      selectedJobRoles: [[], this.validateForm()],
    });
  }

  private prefill(): void {
    if (Array.isArray(this.establishment.vacancies) && this.establishment.vacancies.length) {
      this.vacancies = this.establishment.vacancies;
      this.prefilledJobIds = this.establishment.vacancies.map((vacancy) => Number(vacancy.jobId));
      this.form.patchValue({ selectedJobRoles: this.prefilledJobIds });
    }
  }

  public ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.expandPrefilledJobGroups();
  }

  private expandPrefilledJobGroups(): void {
    this.jobGroups.forEach((group, index) => {
      if (group.items.some((job) => this.prefilledJobIds.includes(job.id))) {
        setTimeout(() => {
          this.accordion.toggleChild(index);
        });
      }
    });
  }

  private validateForm(): ValidatorFn {
    return (formControl) => {
      if (formControl.value?.length > 0) {
        return null;
      } else {
        return { selectedNone: true };
      }
    };
  }

  public onCheckboxClick(target: HTMLInputElement) {
    const jobId = Number(target.value);
    const selectedJobRoles = this.form.get('selectedJobRoles');
    const currentSelectedIds: number[] = this.form.get('selectedJobRoles').value;

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

  private getJobs(): void {
    this.jobsAvailable = this.route.snapshot.data.jobs;
    this.sortJobsByJobGroup(this.jobsAvailable);
  }

  private storeSelectedJobRolesInLocalStorage(): void {
    const selectedJobIds: number[] = this.form.get('selectedJobRoles').value;
    const updatedVacancies: Vacancy[] = selectedJobIds.map((jobId) => {
      const job = this.jobsAvailable.find((job) => job.id === jobId);
      const vacancyNumber = this.vacancies.find((vacancy) => vacancy.jobId === jobId)?.total ?? null;
      return { jobId, title: job.title, total: vacancyNumber };
    });
    localStorage.setItem('updated-vacancies', JSON.stringify(updatedVacancies));
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

  protected onSuccess(): void {}

  protected generateUpdateProps() {
    // suppress the default action of making calls to backend
    return null;
  }

  private getTrainingGroupSummary(jobRoleGroup: { title: string }) {
    return `Jobs like ${this.summaryText[jobRoleGroup.title]}`;
  }

  private sortJobsByJobGroup(jobs: Job[]) {
    for (let group of Object.keys(this.summaryText)) {
      let currentJobGroup = {
        title: group,
        descriptionText: '',
        items: [],
      };

      let jobRolesArray = [];
      jobs.map((x) => {
        if (x.jobRoleGroup === group) {
          jobRolesArray.push({
            label: x.title,
            id: x.id,
          });
        }
      });
      currentJobGroup.items = jobRolesArray;
      currentJobGroup.descriptionText = this.getTrainingGroupSummary(currentJobGroup);
      this.jobGroups.push(currentJobGroup);
    }
  }
}
