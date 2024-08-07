import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingService } from '@core/services/training.service';
import { SelectTrainingCategoryDirective } from '@shared/directives/select-training-category/select-training-category.directive';
import { WorkerService } from '@core/services/worker.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-select-training-category-multiple',
  templateUrl: '../../../../shared/directives/select-training-category/select-training-category.component.html',
})
export class SelectTrainingCategoryMultipleComponent extends SelectTrainingCategoryDirective implements OnInit {
  public selectedStaff = [];
  public accessedFromSummary = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected trainingService: TrainingService,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      trainingService,
      router,
      backLinkService,
      workerService,
      route,
      errorSummaryService,
      establishmentService,
    );
  }

  init(): void {
    this.checkForSelectedStaff();
  }

  public checkForSelectedStaff(): void {
    this.establishmentUid = this.route.snapshot.data.establishment.uid;
    this.selectedStaff = this.trainingService.selectedStaff;
    if (!this.selectedStaff || this.selectedStaff.length === 0) {
      this.trainingService.resetState();

      this.router.navigate(['workplace', this.establishmentUid, 'add-multiple-training', 'select-staff']);
    }
  }

  protected setTitle(): void {
    this.title = 'Select the category that best matches the training taken';
  }

  protected setSectionHeading(): void {
    this.section = 'Add multiple records';
  }

  protected setButtonText(): void {
    this.buttonText = 'Continue';
  }

  public onCancel(event: Event) {
    event.preventDefault();
    this.trainingService.resetState();
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }

  private getNextRoute(): string {
    return this.accessedFromSummary ? 'confirm-training' : 'training-details';
  }

  protected submit(selectedCategory): void {
    this.trainingService.setTrainingCategorySelectedForTrainingRecord(selectedCategory);
    const nextRoute = this.getNextRoute();
    this.trainingService.addMultipleTrainingInProgress$.next(true);
    this.router.navigate(['workplace', this.establishmentUid, 'add-multiple-training', nextRoute]);
  }
}
