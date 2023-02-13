/* eslint-disable @typescript-eslint/no-empty-function */
import { Directive, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SortTrainingOptionsStatus } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Directive()
export class ExpiredAndExpiringTrainingDirective implements OnInit {
  public title: string;
  public trainingList;
  public workplaceUid: string;
  public canEditWorker: boolean;
  public primaryWorkplaceUid: string;
  public flagText: string;
  public img: string;
  public searchTerm = '';
  public trainingCount: number;
  public totalTrainingCount: number;
  public sortTrainingOptions = SortTrainingOptionsStatus;
  public sortByValue = 'staffNameAsc';
  public status: string;
  private subscriptions: Subscription = new Subscription();
  public sortByParamMap = {
    '0_worker': 'staffNameAsc',
    '1_expired': 'expiryDateDesc',
    '2_category': 'categoryNameAsc',
  };

  constructor(
    protected backLinkService: BackLinkService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected permissionsService: PermissionsService,
    protected trainingService: TrainingService,
    protected alertService: AlertService,
  ) {}

  ngOnInit(): void {
    const alertMessage = history.state?.alertMessage;
    alertMessage && this.showAlert(alertMessage);
    this.setTrainingAndCount();
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
    this.primaryWorkplaceUid = this.establishmentService.primaryWorkplace.uid;
    this.init();
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.backLinkService.showBackLink();
    this.setSearchIfPrevious();
    localStorage.setItem('previousUrl', this.router.url);
  }

  protected init(): void {}

  private showAlert(message: string): void {
    this.alertService.addAlert({
      type: 'success',
      message,
    });
  }

  private setSearchIfPrevious(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    if (search) this.searchTerm = search;
  }

  private setTrainingAndCount(): void {
    const { training = [], trainingCount } = this.route.snapshot.data.training;
    this.trainingList = training;
    this.totalTrainingCount = trainingCount;
    this.trainingCount = trainingCount;
  }

  public returnToHome(replaceUrl?: boolean): void {
    const returnLink =
      this.workplaceUid === this.primaryWorkplaceUid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
    this.router.navigate(returnLink, { fragment: 'training-and-qualifications', replaceUrl });
  }

  public getTrainingByStatus(properties: {
    index: number;
    itemsPerPage: number;
    searchTerm: string;
    sortByValue: string;
  }): void {
    const { index, itemsPerPage, searchTerm, sortByValue } = properties;
    this.subscriptions.add(
      this.trainingService
        .getAllTrainingByStatus(this.workplaceUid, this.status, {
          pageIndex: index,
          itemsPerPage,
          sortBy: sortByValue,
          ...(searchTerm ? { searchTerm } : {}),
        })
        .pipe(take(1))
        .subscribe((data) => {
          this.trainingList = data.training;
          this.trainingCount = data.trainingCount;
        }),
    );
  }
}
