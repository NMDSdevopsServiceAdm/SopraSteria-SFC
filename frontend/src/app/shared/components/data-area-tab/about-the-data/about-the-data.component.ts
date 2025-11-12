import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
    selector: 'app-data-area-about-the-data',
    templateUrl: './about-the-data.component.html',
    standalone: false
})
export class DataAreaAboutTheDataComponent implements OnInit {
  public workplace: Establishment;

  constructor(
    private router: Router,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.establishment;

    this.breadcrumbService.show(JourneyType.BENCHMARKS_TAB);
  }

  public returnToBenchmarks(): void {
    this.router.navigate(['/dashboard'], { fragment: 'benchmarks' });
  }
}
