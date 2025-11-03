import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment, SortTrainingOptionsStatus } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-missing-mandatory-training-status',
    templateUrl: './missing-mandatory-training-status.component.html',
    standalone: false
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
    private trainingService: TrainingService,
    protected backLinkService: BackLinkService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.setMissingTrainingAndCount();
    this.workplace = this.route.snapshot.data.establishment;
    this.workplaceUid = this.route.snapshot.params.establishmentuid;

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.setBackLink();
    this.setSearchIfPrevious();
    localStorage.setItem('previousUrl', this.router.url);
  }

  private setSearchIfPrevious(): void {
    const search = this.route.snapshot.queryParamMap.get('search');
    if (search) this.searchTerm = search;
  }

  private setMissingTrainingAndCount(): void {
    const { workers = [], workerCount } = this.route.snapshot.data.training;
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
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }
}
