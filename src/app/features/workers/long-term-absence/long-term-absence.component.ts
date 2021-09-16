import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-long-term-absence',
  templateUrl: './long-term-absence.component.html',
})
export class LongTermAbsenceComponent implements OnInit {
  public worker: Worker;
  private workplace: Establishment;
  constructor(private route: ActivatedRoute, private backService: BackService, private workerService: WorkerService) {}

  ngOnInit(): void {
    this.worker = this.route.snapshot.data.worker;
    this.workplace = this.route.snapshot.data.establishment;
    this.setBackLink();
  }

  public setBackLink(): void {
    this.backService.setBackLink({
      url: ['workplace', this.workplace.uid, 'training-and-qualifications-record', this.worker.uid],
    });
  }
}
