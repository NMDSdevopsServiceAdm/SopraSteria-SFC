import { Component, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-check-cqc-details',
  templateUrl: './check-cqc-details.component.html',
})
export class CheckCQCDetailsComponent implements OnInit {
  public locationId: string;

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.locationId = this.establishmentService.establishment.locationId;
  }
}
