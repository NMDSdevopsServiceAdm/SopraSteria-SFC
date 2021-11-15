import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workplace-tab',
  templateUrl: './workplace-tab.component.html',
})
export class WorkplaceTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() summaryReturnUrl: URLStructure = { url: ['/dashboard'], fragment: 'workplace' };
  @Input() workerCount: number;

  protected subscriptions: Subscription = new Subscription();

  public updateWorkplaceAlert: boolean;
  public locationId: string;
  public showCQCDetailsBanner: boolean = this.establishmentService.checkCQCDetailsBanner;
  public showSharingPermissionsBanner = true;

  constructor(private permissionsService: PermissionsService, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.locationId = this.workplace.locationId;
    this.establishmentService.setCheckCQCDetailsBanner(false);

    this.establishmentService.checkCQCDetailsBanner$.subscribe((showBanner) => {
      this.showCQCDetailsBanner = showBanner;
    });

    this.updateWorkplaceAlert =
      !this.workplace.employerType && this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
