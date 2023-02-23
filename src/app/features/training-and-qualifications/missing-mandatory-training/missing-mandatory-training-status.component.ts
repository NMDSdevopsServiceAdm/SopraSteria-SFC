import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment, SortTrainingOptionsStatus } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-missing-mandatory-training-status',
  templateUrl: './missing-mandatory-training-status.component.html',
})
export class MissingMandatoryTrainingStatusComponent implements OnInit {
  public workplace: Establishment;
  public canEditWorker = false;
  private subscriptions: Subscription = new Subscription();
  public workers;
  public groupByName;
  public workplaceUid: string;
  public searchTerm = '';
  public workerCount: number;
  public totalWorkerCount: number;
  public sortTrainingOptions = SortTrainingOptionsStatus;
  public sortByValue = 'staffNameAsc';
  public sortByParamMap = {
    '0_asc': 'staffNameAsc',
    '1_desc': 'staffNameDesc',
  };

  constructor(
    private permissionsService: PermissionsService,
    public trainingStatusService: TrainingStatusService,
    private router: Router,
    private establishmentService: EstablishmentService,
    private trainingService: TrainingService,
    protected backLinkService: BackLinkService,
    private route: ActivatedRoute,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    const alertMessage = history.state?.alertMessage;
    alertMessage && this.showAlert(alertMessage);
    this.setMissingTrainingAndCount();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplaceUid = this.route.snapshot.params.establishmentuid;

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.setBackLink();
    this.setSearchIfPrevious();
    localStorage.setItem('previousUrl', this.router.url);
  }

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

  private setMissingTrainingAndCount(): void {
    const { workers = [], workerCount } = this.route.snapshot.data.training;
    console.log('*******************');
    console.log(this.route.snapshot.data.training);
    this.workers = workers;
    this.totalWorkerCount = workerCount;
    this.workerCount = workerCount;
  }

  public getMissingMandatoryTraining(properties: {
    index: number;
    itemsPerPage: number;
    searchTerm: string;
    sortByValue: string;
  }): void {
    const { index, itemsPerPage, searchTerm, sortByValue } = properties;
    this.subscriptions.add(
      this.trainingService
        .getMissingMandatoryTraining(this.workplaceUid, {
          pageIndex: index,
          itemsPerPage,
          sortBy: sortByValue,
          ...(searchTerm ? { searchTerm } : {}),
        })
        .pipe(take(1))
        .subscribe((data) => {
          this.workers = data.workers;
          this.workerCount = data.workerCount;
        }),
    );
  }

  public tableRowConditionalClass(training, index): string | null {
    if (training.length > 1 && index === 0) {
      return 'asc-table__cell-no-border__top-row';
    } else if (training.length > 1 && index < training.length - 1) {
      return 'asc-table__cell-no-border__middle-row';
    } else if (training.length > 1 && index === training.length - 1) {
      return 'asc-table__cell-no-border__bottom-row';
    }
    return null;
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public returnToHome(): void {
    const returnLink = this.workplaceUid === this.workplace.uid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
    this.router.navigate(returnLink, { fragment: 'training-and-qualifications' });
  }
}
