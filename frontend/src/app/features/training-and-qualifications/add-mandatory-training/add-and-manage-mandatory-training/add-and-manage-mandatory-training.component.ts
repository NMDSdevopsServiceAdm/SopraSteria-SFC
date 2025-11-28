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
    standalone: false
})
export class AddAndManageMandatoryTrainingComponent implements OnInit {
  public establishment: Establishment;
  public existingMandatoryTrainings: any;
  public allJobsLength: Number;

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
  }

  public sortTrainingAlphabetically(training) {
    training.sort((categoryA: any, categoryB: any) => {
      return categoryA.category.localeCompare(categoryB.category);
    });
  }

  public navigateToAddNewMandatoryTraining(event: Event, mandatoryTrainingToEdit = null): void {
    event.preventDefault();
    this.trainingService.resetState();

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
