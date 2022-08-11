import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  public showSharingPermissionsBanner: boolean;

  constructor(
    private permissionsService: PermissionsService,
    public establishmentService: EstablishmentService,
    public router: Router,
    public route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.locationId = this.workplace.locationId;
    this.establishmentService.setCheckCQCDetailsBanner(false);
    this.getShowCQCDetailsBanner();
    this.showSharingPermissionsBanner = this.workplace.showSharingPermissionsBanner;
    this.updateWorkplaceAlert =
      this.workplace.showAddWorkplaceDetailsBanner &&
      this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
  }

  private getShowCQCDetailsBanner(): void {
    this.establishmentService.checkCQCDetailsBanner$.subscribe((showBanner) => {
      this.showCQCDetailsBanner = showBanner;
    });
  }

  public navigateToShareDataPage(e: Event): void {
    e.preventDefault();

    this.route.snapshot.params?.establishmentuid
      ? this.establishmentService.setReturnTo({ url: ['/workplace', this.workplace.uid], fragment: 'workplace' })
      : this.establishmentService.setReturnTo({ url: ['/dashboard'], fragment: 'workplace' });
    this.router.navigate(['/workplace', this.workplace.uid, 'sharing-data']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
