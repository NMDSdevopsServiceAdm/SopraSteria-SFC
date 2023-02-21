import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment, SortTrainingOptionsMissing } from '@core/model/establishment.model';
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
  public missingTrainingList;
  public groupByName;
  public workplaceUid: string;
  public searchTerm = '';
  public missingTrainingCount: number;
  public totalMissingTrainingCount: number;
  public sortMissingTrainingOptions = SortTrainingOptionsMissing;
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
  ) {}

  ngOnInit(): void {
    this.setMissingTrainingAndCount();
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplaceUid = this.route.snapshot.params.establishmentuid;

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');

    this.setBackLink();
  }

  private setMissingTrainingAndCount(): void {
    const { missingTraining = [], count } = this.route.snapshot.data.training;
    console.log('*****************');
    console.log(missingTraining);
    console.log(count);
    this.missingTrainingList = missingTraining;
    this.totalMissingTrainingCount = count;
    this.missingTrainingCount = count;
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
          this.missingTrainingList = data.missingTraining;
          this.missingTrainingCount = data.count;
        }),
    );
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public returnToHome(): void {
    const returnLink = this.workplaceUid === this.workplace.uid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
    this.router.navigate(returnLink, { fragment: 'training-and-qualifications' });
  }
}
