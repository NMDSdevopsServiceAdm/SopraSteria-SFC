import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Alert } from '@core/model/alert.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
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
      { key: 'Training name', value: training.title },
      { key: 'Training accredited', value: training.accredited },
      { key: 'Date completed', value: training.completed ? dayjs(training.completed).format('D MMMM YYYY') : '-' },
      { key: 'Expiry date', value: training.expires ? dayjs(training.expires).format('D MMMM YYYY') : '-' },
      { key: 'Notes', value: training.notes ? training.notes : 'No notes added' },
    ];
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

    await this.router.navigate([`dashboard`], { fragment: 'training-and-qualifications' });
    this.alertService.addAlert({
      type: 'success',
      message: message,
    } as Alert);
  }
}
