import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Worker } from '@core/model/worker.model';
import { Subscription } from 'rxjs';
import { TrainingCategory } from '@core/model/training.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { SelectTrainingCategoryDirective } from '@shared/directives/select-training-category/select-training-category.directive';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';

@Component({
  selector: 'app-select-training-category',
  // templateUrl: './select-training-category.component.html',
  templateUrl: '../../../../shared/directives/select-training-category/select-training-category.component.html',
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
    this.trainingService.setTrainingCategorySelectedForTrainingRecord(selectedCategory);
    //}
    this.router.navigate([
      `workplace/${this.establishmentUid}/training-and-qualifications-record/${this.workerId}/add-training/details`,
    ]);
  }

  public onCancel(event: any) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }

  protected setSectionHeading(): void {
    this.section = this.worker.nameOrId;
  }
}
