import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '@core/services/training.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-confirm-multiple-training',
  templateUrl: './confirm-multiple-training.component.html',
})
export class ConfirmMultipleTrainingComponent implements OnInit {
  public worker: { key: string; value: string }[];
  public trainingRecord: { key: string; value: string }[];

  constructor(
    protected route: ActivatedRoute,
    protected trainingService: TrainingService,
    protected workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    console.log(this.route);
    console.log(this.trainingService.selectedTraining);
    this.getStaffData();
    this.convertTrainingRecord();
    console.log(this.trainingRecord);
  }

  convertTrainingRecord = () => {
    const training = this.trainingService.selectedTraining;
    this.trainingRecord = [
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
    this.worker = [];
    for (const id of staff) {
      this.workerService
        .getWorker(this.route.snapshot.data.establishment.uid, id)
        .subscribe((x) => this.worker.push({ key: x.nameOrId, value: x.mainJob.title }));
    }
  };
}
