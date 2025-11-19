import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Alert } from '@core/model/alert.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import dayjs from 'dayjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-multiple-training',
  templateUrl: './confirm-multiple-training.component.html',
})
export class ConfirmMultipleTrainingComponent implements OnInit {
  public workers: Worker[];
  public returnLink: string[];
  public trainingRecords: { key: string; value: string }[];
  private workplaceUid: string;
  public subscriptions: Subscription = new Subscription();

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private trainingService: TrainingService,
    public workerService: WorkerService,
    private alertService: AlertService,
    public backLinkService: BackLinkService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.route.snapshot.data.establishment.uid;
    this.getStaffData();
    this.convertTrainingRecord();
    this.backLinkService.showBackLink();
  }

  private convertTrainingRecord(): void {
    const training = this.trainingService.selectedTraining;
    this.trainingRecords = [
      { key: 'Training category', value: training.trainingCategory.category },
      { key: 'Training record name', value: training.title ? training.title : '-' },
      { key: 'Is the training course accredited?', value: training.accredited ? training.accredited : '-' },
      { key: 'Who delivered the training course?', value: training.deliveredBy ? training.deliveredBy : '-' },
      { key: 'Training provider name', value: training.externalProviderName ? training.externalProviderName : '-' },
      {
        key: 'How was the training course delivered?',
        value: training.howWasItDelivered ? training.howWasItDelivered : '-',
      },
      {
        key: 'How long is the training valid for?',
        value: this.showCorrectTrainingValidity(training),
      },
      {
        key: 'Training completion date',
        value: training.completed ? dayjs(training.completed).format('D MMMM YYYY') : '-',
      },
      { key: 'Expiry date', value: training.expires ? dayjs(training.expires).format('D MMMM YYYY') : '-' },
      { key: 'Notes', value: training.notes ? training.notes : 'No notes added' },
    ];
  }

  private showCorrectTrainingValidity(training: any): string {
    if (training.validityPeriodInMonth) {
      if (training.validityPeriodInMonth > 1) {
        return `${training.validityPeriodInMonth} months`;
      } else {
        return `${training.validityPeriodInMonth} month`;
      }
    } else if (training.doesNotExpire) {
      return 'Does not expire';
    } else {
      return '-';
    }
  }

  private getStaffData(): void {
    this.workers = this.trainingService.selectedStaff;
  }

  public getRoutePath(pageName: string): Array<string> {
    return ['/workplace', this.workplaceUid, 'add-multiple-training', 'confirm-training', pageName];
  }

  public onSubmit(): void {
    const selectedStaff = this.workers.map((worker) => worker.uid);
    this.workerService
      .createMultipleTrainingRecords(this.workplaceUid, selectedStaff, this.trainingService.selectedTraining)
      .subscribe(() => this.onSuccess());
  }

  private async onSuccess() {
    const message = `${this.workers.length} training records added`;
    this.trainingService.resetState();

    await this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
    this.alertService.addAlert({
      type: 'success',
      message: message,
    } as Alert);
  }
}
