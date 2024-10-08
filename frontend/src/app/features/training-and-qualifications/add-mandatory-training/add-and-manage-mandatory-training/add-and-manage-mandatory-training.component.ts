import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { TrainingService } from '@core/services/training.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-and-manage-mandatory-training',
  templateUrl: './add-and-manage-mandatory-training.component.html',
})
export class AddAndManageMandatoryTrainingComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public establishment: Establishment;
  public existingMandatoryTrainings: any;
  public allJobsLength: Number;
  public mandatoryTrainingHasDuplicateJobRoles = [];
  public previousAllJobsLength = [29, 31, 32];

  constructor(
    public trainingService: TrainingService,
    private route: ActivatedRoute,
    public jobService: JobService,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    public establishmentService: EstablishmentService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(this.getBreadcrumbsJourney());
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.subscriptions.add(
      this.trainingService.getAllMandatoryTrainings(this.establishment.uid).subscribe((trainings) => {
        this.existingMandatoryTrainings = trainings;
        this.sortTrainingAlphabetically(trainings.mandatoryTraining);
        this.allJobsLength = trainings.allJobRolesCount;
        this.setMandatoryTrainingHasDuplicateJobRoles();
      }),
    );
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

  public navigateToAddNewMandatoryTraining() {
    this.router.navigate([
      '/workplace',
      this.establishmentService.establishment.uid,
      'add-and-manage-mandatory-training',
      'add-new-mandatory-training',
    ]);
  }

  public getBreadcrumbsJourney(): JourneyType {
    return this.establishmentService.isOwnWorkplace() || this.parentSubsidiaryViewService.getViewingSubAsParent()
      ? JourneyType.MANDATORY_TRAINING
      : JourneyType.ALL_WORKPLACES;
  }
}
