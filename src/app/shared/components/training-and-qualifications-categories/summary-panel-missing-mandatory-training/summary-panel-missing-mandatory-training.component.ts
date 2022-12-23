import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-summary-panel-missing-mandatory-training',
  templateUrl: './summary-panel-missing-mandatory-training.component.html',
})
export class SummaryPanelMissingMandatoryTraining implements OnInit {
  public workplace: Establishment;

  public canEditWorker = false;
  private subscriptions: Subscription = new Subscription();

  public trainings;

  constructor(
    private permissionsService: PermissionsService,
    public trainingStatusService: TrainingStatusService,
    private router: Router,
    private establishmentService: EstablishmentService,
    protected trainingCategoryService: TrainingCategoryService,
    protected backLinkService: BackLinkService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.getAllTrainingByCategory();
    this.setBackLink();
  }

  private getAllTrainingByCategory(): void {
    this.subscriptions.add(
      this.trainingCategoryService
        .getCategoriesForMissingTraining(this.workplace.id)
        .pipe(take(1))
        .subscribe((categories: any) => {
          // this.category = categories.find((t: any) => t.isMandatory == true );
          this.trainings = categories.missingTrainings;
          console.log(this.trainings);
        }),
    );
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public trainingStatus(training) {
    return this.trainingStatusService.trainingStatusForRecord(training);
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }
}
