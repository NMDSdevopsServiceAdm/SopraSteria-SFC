import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-about-the-data-link',
  templateUrl: './about-the-data-link.component.html',
})
export class AboutTheDataLinkComponent implements OnInit {
  public workplaceUid: string;
  link = '/workplace';
  constructor(
    private establishmentService: EstablishmentService,
    protected benchmarksService: BenchmarksServiceBase,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    protected router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.establishmentService ? this.establishmentService.primaryWorkplace.uid : null;

    if (this.parentSubsidiaryViewService.getViewingSubAsParent()) {
      this.link = '/subsidiary/workplace';
    }
  }

  public setReturn(): void {
    this.breadcrumbService.canShowBanner = false;
    this.router.navigate([this.link, this.workplaceUid, 'data-area', 'about-the-data']);
  }
}
