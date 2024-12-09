import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';

import { SelectTrainingCategoryDirective } from '../../../../shared/directives/select-training-category/select-training-category.directive';

@Component({
  selector: 'app-select-training-category-multiple',
  templateUrl: '../../../../shared/directives/select-training-category/select-training-category.component.html',
})
export class SelectTrainingCategoryMandatoryComponent extends SelectTrainingCategoryDirective {
  constructor(
    protected formBuilder: FormBuilder,
    protected trainingService: TrainingService,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
  ) {
    super(formBuilder, trainingService, router, backLinkService, workerService, route, errorSummaryService);
  }

  public requiredErrorMessage: string = 'Select the training category that you want to make mandatory';

  init(): void {
    this.establishmentUid = this.route.snapshot.data.establishment.uid;
  }

  protected setSectionHeading(): void {
    this.section = 'Add a mandatory training category';
  }

  protected setTitle(): void {
    this.title = 'Select the training category that you want to make mandatory';
  }

  public onCancel(event: Event) {
    event.preventDefault();
    this.trainingService.resetState();
    this.router.navigate(['workplace', this.establishmentUid, 'add-and-manage-mandatory-training']);
  }

  protected submit(selectedCategory): void {
    this.trainingService.setSelectedTrainingCategory(selectedCategory);
    this.router.navigate(['workplace', this.establishmentUid, 'add-and-manage-mandatory-training', 'select-job-roles']);
  }
}
