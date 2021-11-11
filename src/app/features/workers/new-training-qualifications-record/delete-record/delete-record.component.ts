import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingRecord } from '@core/model/training.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-record',
  templateUrl: './delete-record.component.html',
})
export class DeleteRecordComponent implements OnInit {
  public workplace: Establishment;
  public worker: Worker;
  public trainingRecord: TrainingRecord;
  public trainingRecordId: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workerService: WorkerService,
    private backService: BackService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.workplace = this.route.snapshot.data.establishment;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    this.worker = this.route.snapshot.data.worker;
    this.getTrainingRecord();
    this.setBackLink();
  }

  private getTrainingRecord(): void {
    this.subscriptions.add(
      this.workerService
        .getTrainingRecord(this.workplace.uid, this.worker.uid, this.trainingRecordId)
        .subscribe((trainingRecord) => {
          if (trainingRecord) {
            this.trainingRecord = trainingRecord;
          }
        }),
    );
  }

  private setBackLink(): void {
    this.backService.setBackLink({
      url: [
        'workplace',
        this.workplace.uid,
        'training-and-qualifications-record',
        this.worker.uid,
        'training',
        this.trainingRecordId,
      ],
    });
  }

  public returnToEditPage(event: Event): void {
    event.preventDefault();
    this.router.navigate([
      '/workplace',
      this.workplace.uid,
      'training-and-qualifications-record',
      this.worker.uid,
      'training',
      this.trainingRecordId,
    ]);
  }
}
