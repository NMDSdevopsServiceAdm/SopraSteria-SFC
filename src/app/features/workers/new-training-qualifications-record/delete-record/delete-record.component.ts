import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-delete-record',
  templateUrl: './delete-record.component.html',
})
export class DeleteRecordComponent implements OnInit {
  public workplace: Establishment;
  public worker: Worker;
  private trainingRecordId: string;

  constructor(private route: ActivatedRoute, private workerService: WorkerService) {}

  async ngOnInit(): Promise<void> {
    this.workplace = this.route.snapshot.data.establishment;
    this.trainingRecordId = this.route.snapshot.params.trainingRecordId;
    this.worker = this.route.snapshot.data.worker;
  }
}
