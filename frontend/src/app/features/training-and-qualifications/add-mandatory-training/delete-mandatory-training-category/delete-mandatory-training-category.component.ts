import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { mandatoryTraining } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-delete-mandatory-training-category',
    templateUrl: './delete-mandatory-training-category.component.html',
    standalone: false
})
export class DeleteMandatoryTrainingCategoryComponent implements OnInit, OnDestroy {
  public selectedCategory: mandatoryTraining;
  public establishment: Establishment;
  public allJobRolesCount: number;
  private subscriptions: Subscription = new Subscription();

  constructor(
    protected backLinkService: BackLinkService,
    protected trainingService: TrainingService,
    protected trainingCategoryService: TrainingCategoryService,
    protected route: ActivatedRoute,
    protected router: Router,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();

    const trainingCategoryIdInParams = parseInt(this.route.snapshot.params?.trainingCategoryId);
    this.establishment = this.route.snapshot.data.establishment;
    const existingMandatoryTraining = this.route.snapshot.data.existingMandatoryTraining;

    this.allJobRolesCount = existingMandatoryTraining?.allJobRolesCount;

    this.selectedCategory = existingMandatoryTraining?.mandatoryTraining.find(
      (category) => category.trainingCategoryId === trainingCategoryIdInParams,
    );

    if (!this.selectedCategory) {
      this.navigateBackToMandatoryTrainingHomePage();
    }
  }

  public onDelete(): void {
    this.subscriptions.add(
      this.trainingService
        .deleteCategoryById(this.establishment.id, this.selectedCategory.trainingCategoryId)
        .subscribe(() => {
          this.navigateBackToMandatoryTrainingHomePage().then(() => {
            this.alertService.addAlert({
              type: 'success',
              message: 'Mandatory training category removed',
            });
          });
        }),
    );
  }

  public navigateBackToMandatoryTrainingHomePage(): Promise<boolean> {
    return this.router.navigate(['/workplace', this.establishment.uid, 'add-and-manage-mandatory-training']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
