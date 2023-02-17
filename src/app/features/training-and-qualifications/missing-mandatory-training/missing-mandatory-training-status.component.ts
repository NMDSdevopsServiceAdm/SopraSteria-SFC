import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
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

  public trainings;
  public groupByName;
  public workplaceUid: string;

  missingTrainingArray = [];

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
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplaceUid = this.route.snapshot.params.establishmentuid;

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');

    this.getAllMissingMandatoryTrainings();
    this.setBackLink();
  }

  private getAllMissingMandatoryTrainings(): void {
    this.subscriptions.add(
      this.trainingService
        .getMissingMandatoryTraining(this.workplace.id)
        .pipe(take(1))
        .subscribe((workers: any) => {
          console.log('***************');
          console.log(workers.missingTraining[0].mainJob);
          console.log(workers.missingTraining[0].mainJob.MandatoryTraining[0].workerTrainingCategories);

          this.missingTrainingArray = workers.missingTraining.map((worker) => {
            return {
              name: worker.NameOrIdValue,
              missingTraining: worker.mainJob.MandatoryTraining.map((mandatoryTraining) => {
                return {
                  category: mandatoryTraining.workerTrainingCategories.cate,
                };
              }),
            };
          });
          console.log(this.missingTrainingArray);
        }),
    );
  }

  public removeIdFromKey(key: string) {
    return key.replace(/[0-9]/g, '');
  }

  public getKeys() {
    return Object.keys(this.groupByName);
  }

  public findUidForWorker(key) {
    return this.groupByName[key].find((u) => u.uid).uid;
  }

  protected setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public trainingStatus(training) {
    return this.trainingStatusService.trainingStatusForRecord(training);
  }

  public returnToHome(): void {
    const returnLink = this.workplaceUid === this.workplace.uid ? ['/dashboard'] : ['/workplace', this.workplaceUid];
    this.router.navigate(returnLink, { fragment: 'training-and-qualifications' });
  }
}
