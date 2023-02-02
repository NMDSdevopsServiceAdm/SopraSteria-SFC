import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Establishment,
  SortTrainingAndQualsOptionsWorker,
  SortTrainingAndQualsOptionsWorkerNoMissing,
} from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training-and-qualifications-categories-view',
  templateUrl: './view-trainings.component.html',
})
export class ViewTrainingComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public primaryWorkplaceUid: string;
  public category: string;
  public canEditWorker = false;
  public trainingCategoryId: number;
  private subscriptions: Subscription = new Subscription();
  public sortTrainingAndQualOptions: any;
  public sortByValue = '0_expired';
  public searchTerm = '';
  public trainingCount: number;
  public totalTrainingCount: number;
  public isMandatory: boolean;
  public sortByParamMap: any;
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
    this.workplace = this.establishmentService.establishment;
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.trainingCategoryId = this.route.snapshot.params.categoryId;
    this.setWorkersAndCount();
    this.setExpiresSoonAlertDates();
    this.setBackLink();
    this.setSortParamMapAndOptions();
    localStorage.setItem('previousUrl', this.router.url);
  }

  private setWorkersAndCount(): void {
    const { training = [], category, trainingCount, isMandatory } = this.route.snapshot.data.training;
    console.log(this.route.snapshot.data.training);
    this.trainings = training;
    this.category = category;
    this.totalTrainingCount = trainingCount;
    this.trainingCount = trainingCount;
    this.isMandatory = isMandatory;
  }

  private setSortParamMapAndOptions(): void {
    if (this.isMandatory) {
      this.sortByParamMap = {
        '0_expired': 'trainingExpired',
        '1_expires_soon': 'trainingExpiringSoon',
        '2_missing': 'trainingMissing',
        '3_worker': 'staffNameAsc',
      };
      this.sortTrainingAndQualOptions = SortTrainingAndQualsOptionsWorker;
    } else {
      this.sortByParamMap = {
        '0_expired': 'trainingExpired',
        '1_expires_soon': 'trainingExpiringSoon',
        '2_worker': 'staffNameAsc',
      };
      this.sortTrainingAndQualOptions = SortTrainingAndQualsOptionsWorkerNoMissing;
    }
  }

  private setExpiresSoonAlertDates(): void {
    this.subscriptions.add(
      this.establishmentService.getExpiresSoonAlertDates(this.workplace.uid).subscribe((date) => {
        this.trainingStatusService.expiresSoonAlertDate$.next(date.expiresSoonAlertDate);
      }),
    );
  }

  public getWorkersByTrainingCategory(properties: {
    index: number;
    itemsPerPage: number;
    searchTerm: string;
    sortByValue: string;
  }): void {
    const { index, itemsPerPage, searchTerm, sortByValue } = properties;
    console.log(sortByValue);
    this.subscriptions.add(
      this.trainingCategoryService
        .getTrainingCategory(this.workplace.id, this.trainingCategoryId, {
          pageIndex: index,
          itemsPerPage: itemsPerPage,
          sortBy: sortByValue,
          ...(searchTerm ? { searchTerm } : {}),
        })
        .pipe(take(1))
        .subscribe((data) => {
          this.trainings = data.training;
          this.trainingCount = data.trainingCount;
          console.log(this.trainingCount);
        }),
    );
  }

  // private getAllTrainingByCategory(): void {
  //   this.subscriptions.add(
  //     this.trainingCategoryService
  //       .getCategoriesWithTraining(this.workplace.id)
  //       .pipe(take(1))
  //       .subscribe((categories: any) => {
  //         this.category = categories.find((t: any) => t.id == this.trainingCategoryId);
  //         localStorage.setItem(
  //           'trainingCategory',
  //           JSON.stringify({ id: this.category.id, category: this.category.category }),
  //         );
  //         console.log('##############');
  //         this.trainings = this.category.training;
  //         console.log(this.trainings);
  //         this.sortByTrainingStatus();
  //       }),
  //   );
  // }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public trainingStatus(training): number {
    return this.trainingStatusService.trainingStatusForRecord(training);
  }

  public returnToHome(): void {
    const returnLink =
      this.workplace.uid === this.primaryWorkplaceUid ? ['/dashboard'] : ['/workplace', this.workplace.uid];
    this.router.navigate(returnLink, { fragment: 'training-and-qualifications' });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
