import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
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
    private workerService: WorkerService
  ) {}

  ngOnInit() {
    this.workplace = this.route.parent.snapshot.data.establishment;
    const journey = this.establishmentService.isOwnWorkplace() ? JourneyType.MY_WORKPLACE : JourneyType.ALL_WORKPLACES;
    this.breadcrumbService.show(journey);
    this.setTrainingAndQualifications();
    this.subscriptions.add(
      this.workerService.alert$.subscribe(alert => {
        if (alert) {
          this.alertService.addAlert(alert);
          this.workerService.alert = null;
        }
      })
    );

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.canViewWorker = this.permissionsService.can(this.workplace.uid, 'canViewWorker');
  }

  //This method is used to set training & qualifications list and their counts and alret flag
  public setTrainingAndQualifications() {
    this.subscriptions.add(
      this.workerService.worker$.pipe(take(1)).subscribe(
        worker => {
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
          },
        error => {
          console.error(error.error);
        }
      )
    );
  }
  /**
   * Function used to set training alert flag over the traing and qualifications tab
   * @param {traingRecords} list of trainging record
   * @return {number} 0 for up-to-date, 1 for expiring soon and 2 for expired.
   */
  public getTrainingFlag(trainingRecords) {
    let expired = false;
    let expiring = false;
     let missing = false;
    const currentDate = moment();
    //check training status
    trainingRecords.forEach(training => {
      if (training.expires) {
        const expiringDate = moment(training.expires);
        const daysDiffrence = expiringDate.diff(currentDate, 'days');
        if (daysDiffrence < 0) {
          expired = true;
        } else if (daysDiffrence >= 0 && daysDiffrence <= 90) {
          expiring = true;
        }
      }else if( training.missing){
        missing = true;
      }
    });
    // return for flag value
    if (missing) {
      return 3;
    } else if (expiring) {
      return 1;
  } else if (expiring) {
      return 1;
    } else {
      return 0;
    }
  }
  //event handler from traingin and qualification component.
  public trainingAndQualificationsChangedHandler(refresh) {
    if (refresh) {
      this.setTrainingAndQualifications();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
