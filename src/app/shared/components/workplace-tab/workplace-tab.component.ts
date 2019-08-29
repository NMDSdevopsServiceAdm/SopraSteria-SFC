import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Component({
  selector: 'app-workplace-tab',
  templateUrl: './workplace-tab.component.html',
})
export class WorkplaceTabComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() summaryReturnUrl: URLStructure = { url: ['/dashboard'], fragment: 'workplace' };

  public updateWorkplaceAlert: boolean;

  constructor(private permissionsService: PermissionsService) {}

  ngOnInit() {
    this.updateWorkplaceAlert =
      !this.workplace.employerType && this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
  }
}
