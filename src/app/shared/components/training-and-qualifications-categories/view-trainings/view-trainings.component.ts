import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training-and-qualifications-categories-view',
  templateUrl: './view-trainings.component.html',
})
export class ViewTrainingComponent implements OnInit {
  public workplace: Establishment;
  public trainingCategories: [];
  public canEditWorker = false;
  public trainingCategoryId;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private permissionsService: PermissionsService,
    public trainingStatusService: TrainingStatusService,
    private workerService: WorkerService,
    private router: Router,
    private establishmentService: EstablishmentService,
    protected trainingCategoryService: TrainingCategoryService,
    protected backLinkService: BackLinkService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');

    this.getAllTrainingByCategory();
    this.setBackLink();

    this.trainingCategoryId = this.route.snapshot.params.categoryId;
  }

  private getAllTrainingByCategory(): void {
    this.subscriptions.add(
      this.trainingCategoryService
        .getCategoriesWithTraining(this.workplace.id)

        .pipe(take(1))
        .subscribe((trainingCategories) => {
          this.trainingCategories = trainingCategories;
          console.log(this.trainingCategories);
        }),
    );
  }
  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public updateTrainingRecord(event, training): void {
    event.preventDefault();
    localStorage.setItem('trainingCategoryId', this.trainingCategoryId);
    // this.workerService.getRoute$.next('/dashboard?view=categories#training-and-qualifications');

    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      training.worker.uid,
      'training',
      training.uid,
    ]);
  }

  public addTrainingRecord(event, training): void {
    event.preventDefault();

    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      training.worker.uid,
      'add-training',
    ]);
  }

  public trainingIsComplete(training) {
    return (
      [
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.EXPIRED),
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.EXPIRING),
        this.trainingStatusService.trainingStatusCount(training, this.trainingStatusService.MISSING),
      ].reduce((total, num) => {
        return total + num;
      }) === 0
    );
  }

  public trainingStatus(training) {
    return this.trainingStatusService.trainingStatusForRecord(training);
  }

  public returnToHome() {
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }
}
