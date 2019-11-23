import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-training-and-qualifications-record',
  templateUrl: './training-and-qualifications-record.component.html',
})
export class TrainingAndQualificationsRecordComponent implements OnInit, OnDestroy {
  public canDeleteWorker: boolean;
  public canEditWorker: boolean;
  public returnToQualifications: URLStructure;
  public returnToTraining: URLStructure;
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
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.workplace = this.route.parent.snapshot.data.establishment;
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);

    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe(worker => {
        this.worker = worker;
        this.qualificationsCount = 0;
        this.trainingCount = 0;
        this.trainingAndQualsCount = 0;
        //get qualification count
        this.workerService.getQualifications(this.workplace.uid, this.worker.uid).subscribe(
          qual => {
            this.qualificationsCount = qual.qualifications.length;
          },
          error => {
            console.error(error.error);
          }
        );
        //get trainging count and flag
        this.workerService
          .getTrainingRecords(this.workplace.uid, this.worker.uid)
          .pipe(take(1))
          .subscribe(
            training => {
              this.trainingCount = training.count;
              this.trainingAlert = this.getTrainingFlag(training.training);
            },
            error => {
              console.error(error.error);
            }
          );
      })
    );

    this.subscriptions.add(
      this.workerService.alert$.subscribe(alert => {
        if (alert) {
          this.alertService.addAlert(alert);
        }
      })
    );

    this.canDeleteWorker = this.permissionsService.can(this.workplace.uid, 'canDeleteWorker');
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }

  public getTrainingFlag(traingRecords) {
    let expired = false;
    let expiring = false;

    const currentDate = moment();
    //check traingin status
    traingRecords.forEach(training => {
      if (training.expires) {
        const expiringDate = moment(training.expires);
        if (currentDate > expiringDate) {
          expired = true;
        } else if (expiringDate.diff(currentDate, 'days') <= 90) {
          expiring = true;
        }
      }
    });
    // return for flag value
    if (expired) {
      return 2;
    } else if (expiring) {
      return 1;
    } else {
      return 0;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
