import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { MandatoryTrainingService } from '@core/services/training.service';

@Component({
  selector: 'app-add-and-manage-mandatory-training',
  templateUrl: './add-and-manage-mandatory-training.component.html',
})
export class AddAndManageMandatoryTrainingComponent implements OnInit {
  public establishment: Establishment;
  public existingMandatoryTrainings: any;
  public allJobsLength: Number;
  public mandatoryTrainingHasDuplicateJobRoles = [];
  public previousAllJobsLength = [29, 31, 32];

  constructor(
    public trainingService: MandatoryTrainingService,
    private route: ActivatedRoute,
    public jobService: JobService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    public establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.MANDATORY_TRAINING);

    this.establishment = this.route.snapshot.data?.establishment;
    this.existingMandatoryTrainings = this.route.snapshot.data?.existingMandatoryTraining;
    this.sortTrainingAlphabetically(this.existingMandatoryTrainings.mandatoryTraining);
    this.allJobsLength = this.existingMandatoryTrainings.allJobRolesCount;
    this.setMandatoryTrainingHasDuplicateJobRoles();
  }

  public checkDuplicateJobRoles(jobs): boolean {
    for (let i = 0; i < jobs.length; i++) {
      for (let j = i + 1; j < jobs.length; j++) {
        if (jobs[i].id === jobs[j].id) {
          return true;
        }
      }
    }
  }

  public setMandatoryTrainingHasDuplicateJobRoles() {
    let mandatoryTraining = this.existingMandatoryTrainings.mandatoryTraining;

    mandatoryTraining.forEach((trainingCategory, index) => {
      this.mandatoryTrainingHasDuplicateJobRoles.push({
        [trainingCategory.trainingCategoryId]: {
          hasDuplicates: this.checkDuplicateJobRoles(trainingCategory.jobs),
          hasPreviousAllJobsLength: this.previousAllJobsLength.includes(trainingCategory.jobs.length),
        },
      });
    });
  }

  public sortTrainingAlphabetically(training) {
    training.sort((categoryA: any, categoryB: any) => {
      return categoryA.category.localeCompare(categoryB.category);
    });
  }

  public navigateToAddNewMandatoryTraining(event: Event, mandatoryTrainingToEdit = null): void {
    event.preventDefault();

    if (mandatoryTrainingToEdit) {
      this.trainingService.mandatoryTrainingBeingEdited = mandatoryTrainingToEdit;
    }

    this.router.navigate(['select-training-category'], { relativeTo: this.route });
  }

  public navigateToDeletePage(event: Event, trainingCategoryId: number): void {
    event.preventDefault();
    this.router.navigate([trainingCategoryId, 'delete-mandatory-training-category'], { relativeTo: this.route });
  }
}
