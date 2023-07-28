import { Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-become-a-parent',
  templateUrl: './become-a-parent.component.html',
})
export class BecomeAParentComponent implements OnInit {
  public workplace: Establishment;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
  }
}
