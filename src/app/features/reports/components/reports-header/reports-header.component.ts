import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-reports-header',
  templateUrl: './reports-header.component.html',
})
export class ReportsHeaderComponent implements OnInit {
  @Input() title = 'Reports';

  public establishment: Establishment;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.establishment = this.route.snapshot.data.establishment;
  }
}
