import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MultipleTrainingResponse } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-multiple-training',
  templateUrl: './confirm-multiple-training.component.html',
})
export class ConfirmMultipleTrainingComponent implements OnInit {
  public workers: { key: string; value: string }[];
  public trainingRecords: { key: string; value: string }[];
  private workplaceUid: string;
  public subscriptions: Subscription = new Subscription();

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
    protected alertService: AlertService,
  ) {
    this.workplaceUid = this.route.snapshot.data.establishment.uid;
  }

  ngOnInit(): void {
    this.getStaffData();
    this.convertTrainingRecord();
  }

  convertTrainingRecord = () => {
    const training = this.trainingService.selectedTraining;
    this.trainingRecords = [
      { key: 'Training category', value: training.trainingCategory?.id },
      { key: 'Training name', value: training.title },
      { key: 'Training accredited', value: training.accredited },
      { key: 'Date completed', value: training.completed },
      { key: 'Exiry date', value: training.expires },
      { key: 'Notes', value: training.notes },
    ];
  };

  getStaffData = () => {
    const staff = this.trainingService.selectedStaff;
    this.workers = [];
    for (const id of staff) {
      this.workerService.getWorker(this.workplaceUid, id).subscribe((x) => {
        this.workers.push({ key: x.nameOrId, value: x.mainJob.title });
      });
    }
  };

  public getRoutePath(pageName: string): Array<string> {
    return ['/workplace', this.workplaceUid, 'add-multiple-training', pageName];
  }

  public onSubmit(): void {
    this.subscriptions.add(
      this.workerService
        .createMultipleTrainingRecords(
          this.workplaceUid,
          this.trainingService.selectedStaff,
          this.trainingService.selectedTraining,
        )
        .subscribe(
          (response: MultipleTrainingResponse) => this.onSuccess(),
          (error) => this.onError(error),
        ),
    );
  }

  private onError = (x) => {
    console.log(x);
  };

  private onSuccess = () => {
    this.router.navigate([`dashboard`], { fragment: 'training-and-qualifications' }).then(() => {
      this.alertService.addAlert({
        type: 'success',
        message: 'Training has been added.',
      });
    });
  };
}
