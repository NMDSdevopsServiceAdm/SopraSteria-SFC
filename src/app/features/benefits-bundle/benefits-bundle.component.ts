import { Component, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-benefits-bundle',
  templateUrl: './benefits-bundle.component.html',
})
export class BenefitsBundleComponent implements OnInit {
  public workplaceName: string;

  constructor(private establishmentService: EstablishmentService) {}

  public ngOnInit(): void {
    this.workplaceName = this.establishmentService.primaryWorkplace.name;
  }
}
