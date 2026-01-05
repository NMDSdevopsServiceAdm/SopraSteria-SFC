import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectTrainingCategoryDirective } from '@shared/directives/select-training-category/select-training-category.directive';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-select-training-category',
  templateUrl: '../../../../shared/directives/select-training-category/select-training-category.component.html',
  standalone: false,
})
export class SelectTrainingCategoryComponent extends SelectTrainingCategoryDirective implements OnInit {
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

  init(): void {
    this.worker = this.workerService.worker;
    this.route.params.subscribe((params) => {
      if (params) {
        this.establishmentUid = params.establishmentuid;
        this.workerId = params.id;
      }
    });
  }

  protected submit(selectedCategory): void {
    this.trainingService.setSelectedTrainingCategory(selectedCategory);
    this.router.navigate([
      `workplace/${this.establishmentUid}/training-and-qualifications-record/${this.workerId}/add-training-without-course/details`,
    ]);
  }

  public onCancel(event: any) {
    event.preventDefault();
    this.trainingService.clearSelectedTrainingCategory();
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }

  protected setSectionHeading(): void {
    this.section = this.worker.nameOrId;
  }
}
