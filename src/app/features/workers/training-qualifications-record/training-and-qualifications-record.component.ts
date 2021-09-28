import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingStatusService } from '@core/services/trainingStatus.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-and-qualifications-record',
  templateUrl: './training-and-qualifications-record.component.html',
})
export class TrainingAndQualificationsRecordComponent implements OnInit, OnDestroy {
  public canEditWorker: boolean;
  public canViewWorker: boolean;
  public worker: Worker;
  public workplace: Establishment;
  public trainingAndQualsCount: number;
  public trainingAlert: number;
  public qualificationsCount: number;
  public trainingCount: number;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private workerService: WorkerService,
    private trainingStatusService: TrainingStatusService,
  ) {}

  ngOnInit() {
    this.workplace = this.route.parent.snapshot.data.establishment;
    this.worker = this.route.snapshot.data.worker;
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
    this.setTrainingAndQualifications();
    this.setReturnTo();
    this.subscriptions.add(
      this.workerService.alert$.subscribe((alert) => {
        if (alert) {
          this.alertService.addAlert(alert);
          this.workerService.alert = null;
        }
      }),
    );

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
  }

  // This method is used to set training & qualifications list and their counts and alert flag
  public setTrainingAndQualifications() {
    this.qualificationsCount = this.route.snapshot.data.qualifications.count;
    this.trainingCount = this.route.snapshot.data.trainingRecords.count;
    this.trainingAlert = this.trainingStatusService.getAggregatedStatus(
      this.route.snapshot.data.trainingRecords.training,
    );
  }

  //event handler from training and qualification component.
  public trainingAndQualificationsChangedHandler(refresh) {
    if (refresh) {
      this.setTrainingAndQualifications();
    }
  }

  private setReturnTo(): void {
    const returnToRecord = {
      url: ['/workplace', this.workplace.uid, 'training-and-qualifications-record', this.worker.uid, 'training'],
    };
    this.workerService.setReturnTo(returnToRecord);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
