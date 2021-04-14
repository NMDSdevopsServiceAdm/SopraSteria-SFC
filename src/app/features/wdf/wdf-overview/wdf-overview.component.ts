import { Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-wdf-overview',
  templateUrl: './wdf-overview.component.html',
})
export class WdfOverviewComponent implements OnInit {
  public workplace: Establishment;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
  }
}
