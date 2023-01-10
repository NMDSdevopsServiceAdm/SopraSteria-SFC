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
  templateUrl: './missing-mandatory-training.component.html',
})
export class MissingMandatoryTrainingComponent implements OnInit {
  public workplace: Establishment;

  public canEditWorker = false;
  private subscriptions: Subscription = new Subscription();

  public trainings;
  public gropByName;

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

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.getAllMissingMandatoryTrainings();
    this.setBackLink();
  }

  private getAllMissingMandatoryTrainings(): void {
    this.subscriptions.add(
      this.trainingService
        .getMissingMandatoryTraining(this.workplace.id)
        .pipe(take(1))
        .subscribe((categories: any) => {
          this.trainings = categories.missingTrainings;
          this.gropByName = this.trainings.groupBy((item) => item.workerName + item.workerId);
          this.getKeys().forEach((key) => {
            const newValue = {
              key,
              name: this.removeIdFromKey(key),
              uid: this.findUidForWorker(key),
              value: this.gropByName[key],
            };

            this.missingTrainingArray.push(newValue);
          });
        }),
    );
  }

  removeIdFromKey(key: string) {
    return key.replace(/[0-9]/g, '');
  }

  getKeys() {
    return Object.keys(this.gropByName);
  }

  findUidForWorker(key) {
    return this.gropByName[key].find((u) => u.uid).uid;
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
