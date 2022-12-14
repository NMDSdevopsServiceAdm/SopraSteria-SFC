import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training-and-qualifications-categories-view',
  templateUrl: './view-trainings.component.html',
})
export class ViewTrainingComponent implements OnInit {
  public workplace: Establishment;
  public category: any;
  public canEditWorker = false;
  public trainingCategoryId;
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

    this.trainingCategoryId = this.route.snapshot.params.categoryId;
    localStorage.setItem('trainingCategoryId', this.trainingCategoryId);
    this.setExpiresSoonAlertDates();
    this.getAllTrainingByCategory();
    this.setBackLink();
  }

  private setExpiresSoonAlertDates(): void {
    this.subscriptions.add(
      this.establishmentService.getExpiresSoonAlertDates(this.workplace.uid).subscribe((date) => {
        this.trainingStatusService.expiresSoonAlertDate$.next(date.expiresSoonAlertDate);
      }),
    );
  }

  private getAllTrainingByCategory(): void {
    this.subscriptions.add(
      this.trainingCategoryService
        .getCategoriesWithTraining(this.workplace.id)
        .pipe(take(1))
        .subscribe((categories: any) => {
          this.category = categories.find((t: any) => t.id == this.trainingCategoryId);

          this.trainings = this.category.training;

          this.sortByTrainingStatus();
        }),
    );
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public updateTrainingRecord(event, training): void {
    event.preventDefault();

    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      training.worker.uid,
      'training',
      training.uid,
    ]);
  }

  public trainingStatus(training) {
    return this.trainingStatusService.trainingStatusForRecord(training);
  }

  public sortByTrainingStatus() {
    const missings = this.trainings.filter((t: any) => t.missing);
    const expired = this.trainings.filter((t: any) => {
      if (t.expires) {
        const expiringDate = dayjs(t.expires);
        const currentDate = dayjs();
        const daysDifference = expiringDate.diff(currentDate, 'days');
        return daysDifference < 0;
      }
      return false;
    });

    const expireSoon = this.trainings.filter((t: any) => {
      if (t.expires) {
        const expiringDate = dayjs(t.expires);
        const currentDate = dayjs();
        const daysDifference = expiringDate.diff(currentDate, 'days');
        return daysDifference >= 0 && daysDifference <= 90 ? true : false;
      }
      return false;
    });

    const mergeA = expired.concat(expireSoon).concat(missings);
    const ok = this.trainings.filter((t: any) => mergeA.every((f: any) => f.id !== t.id));

    this.trainings = mergeA.concat(ok);
  }
  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }
}
