import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-about-the-data-link',
  templateUrl: './about-the-data-link.component.html',
})
export class AboutTheDataLinkComponent implements OnInit {
  public workplaceUid: string;

  constructor(
    private establishmentService: EstablishmentService,
    protected benchmarksService: BenchmarksService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService ? this.establishmentService.primaryWorkplace.uid : null;
  }

  public setReturn(): void {
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }
}
