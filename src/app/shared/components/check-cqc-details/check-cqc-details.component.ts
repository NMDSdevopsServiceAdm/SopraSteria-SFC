import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Component({
  selector: 'app-check-cqc-details',
  templateUrl: './check-cqc-details.component.html',
})
export class CheckCQCDetailsComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() summaryReturnUrl: URLStructure = { url: ['/dashboard'], fragment: 'workplace' };

  public cqcDetailsCheck: boolean;
  public locationId: string;

  constructor(private permissionsService: PermissionsService, private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.locationId = this.establishmentService.primaryWorkplace.locationId;

    this.cqcDetailsCheck = true;
  }
}
