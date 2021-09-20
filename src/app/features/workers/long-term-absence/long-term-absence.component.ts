import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-long-term-absence',
  templateUrl: './long-term-absence.component.html',
})
export class LongTermAbsenceComponent implements OnInit {
  public worker: Worker;
  public returnToUrl: URLStructure;
  private workplace: Establishment;
  constructor(private route: ActivatedRoute, private backService: BackService, private workerService: WorkerService) {}

  ngOnInit(): void {
    this.worker = this.route.snapshot.data.worker;
    this.workplace = this.route.snapshot.data.establishment;
    this.returnToUrl = this.workerService.returnTo;
    this.setBackLink();
  }

  public setBackLink(): void {
    this.backService.setBackLink(this.returnToUrl);
  }
}
