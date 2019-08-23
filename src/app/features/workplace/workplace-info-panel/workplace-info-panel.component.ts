import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Component({
  selector: 'app-workplace-info-panel',
  templateUrl: './workplace-info-panel.component.html',
})
export class WorkplaceInfoPanelComponent implements OnInit {
  @Input() public workplace: Workplace;
  public canViewEstablishment: boolean;
  public primaryWorkplace: Establishment;
  public dataOwner = WorkplaceDataOwner;

  constructor(private establishmentService: EstablishmentService, private permissionsService: PermissionsService) {}

  ngOnInit() {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.canViewEstablishment = this.permissionsService.can(this.primaryWorkplace.uid, 'canViewEstablishment');
  }
}
