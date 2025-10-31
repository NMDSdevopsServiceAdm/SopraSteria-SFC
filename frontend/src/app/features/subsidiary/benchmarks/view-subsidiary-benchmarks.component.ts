import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';

@Component({
    selector: 'app-view-subsidiary-benchmarks',
    templateUrl: './view-subsidiary-benchmarks.component.html',
    standalone: false
})
export class ViewSubsidiaryBenchmarksComponent implements OnInit {
  public workplace: Establishment;
  public canSeeNewDataArea: boolean;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.workplace = this.route.snapshot.data.establishment;
    this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
  }
}
