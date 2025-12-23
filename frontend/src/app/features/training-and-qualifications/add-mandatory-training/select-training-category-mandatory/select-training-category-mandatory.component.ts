import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { MandatoryTrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';

import { SelectTrainingCategoryDirective } from '../../../../shared/directives/select-training-category/select-training-category.directive';

@Component({
    selector: 'app-select-training-category-mandatory',
    templateUrl: '../../../../shared/directives/select-training-category/select-training-category.component.html',
    standalone: false
})
export class SelectTrainingCategoryMandatoryComponent extends SelectTrainingCategoryDirective {
  public requiredErrorMessage: string = 'Select the training category that you want to make mandatory';
  public hideOtherCheckbox: boolean = true;
  private mandatoryTrainingCategoryIdBeingEdited: number;

  constructor(
    protected formBuilder: FormBuilder,
    protected trainingService: MandatoryTrainingService,
    protected router: Router,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
    protected route: ActivatedRoute,
    protected errorSummaryService: ErrorSummaryService,
  ) {
    super(formBuilder, trainingService, router, backLinkService, workerService, route, errorSummaryService);
  }

  init(): void {
    this.establishmentUid = this.route.snapshot.data.establishment.uid;
    this.mandatoryTrainingCategoryIdBeingEdited =
      this.trainingService.mandatoryTrainingBeingEdited?.trainingCategoryId ?? null;
    this.getPrefilledId();
  }

  protected getPrefilledId(): void {
    const selectedCategory = this.trainingService.selectedTraining?.trainingCategory;

    if (selectedCategory) {
      this.preFilledId = selectedCategory?.id;
    } else if (this.mandatoryTrainingCategoryIdBeingEdited) {
      this.preFilledId = this.trainingService.mandatoryTrainingBeingEdited.trainingCategoryId;
    }
  }

  protected setSectionHeading(): void {
    this.section = 'Add a mandatory training category';
  }

  protected setTitle(): void {
    this.title = 'Select the training category that you want to make mandatory';
  }

  protected getCategories(): void {
    const allTrainingCategories = this.route.snapshot.data.trainingCategories;
    const existingMandatoryTraining = this.route.snapshot.data.existingMandatoryTraining;

    this.trainingService.allJobRolesCount = existingMandatoryTraining.allJobRolesCount;

    const trainingCategoryIdsWithExistingMandatoryTraining = existingMandatoryTraining?.mandatoryTraining?.map(
      (existingMandatoryTrainings) => existingMandatoryTrainings.trainingCategoryId,
    );

    if (trainingCategoryIdsWithExistingMandatoryTraining?.length) {
      this.categories = allTrainingCategories.filter(
        (category) =>
          !trainingCategoryIdsWithExistingMandatoryTraining.includes(category.id) ||
          category.id == this.mandatoryTrainingCategoryIdBeingEdited,
      );
    } else {
      this.categories = allTrainingCategories;
    }

    this.trainingGroups = TrainingCategoryService.sortTrainingCategoryByGroups(this.categories);
  }

  protected prefillForm(): void {
    if (this.preFilledId) {
      this.form.patchValue({ category: this.preFilledId });
    }
  }

  public onCancel(event: Event): void {
    event.preventDefault();
    this.trainingService.resetState();
    this.router.navigate(['workplace', this.establishmentUid, 'add-and-manage-mandatory-training']);
  }

  protected submit(selectedCategory): void {
    this.trainingService.setSelectedTrainingCategory(selectedCategory);
    this.router.navigate([
      'workplace',
      this.establishmentUid,
      'add-and-manage-mandatory-training',
      'all-or-selected-job-roles',
    ]);
  }
}
