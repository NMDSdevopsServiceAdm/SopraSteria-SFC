import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-about-the-data-link',
  templateUrl: './about-the-data-link.component.html',
})
export class AboutTheDataLinkComponent implements OnInit {
  public workplaceUid: string;

  constructor(
    private establishmentService: EstablishmentService,
    protected benchmarksService: BenchmarksServiceBase,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    protected router: Router,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService ? this.establishmentService.primaryWorkplace.uid : null;

  }

  public setReturn(): void {
    this.router.navigate(['/workplace', this.workplaceUid, 'data-area', 'about-the-data']);
  }
}
