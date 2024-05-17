import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { SubsidiaryTabsService } from '@core/services/tabs-interface.service';

@Component({
  selector: 'app-view-subsidiary-workplace',
  templateUrl: './view-subsidiary-workplace.component.html',
})
export class ViewSubsidiaryWorkplaceComponent implements OnInit {
  public summaryReturnUrl: URLStructure = { url: ['/dashboard'], fragment: 'workplace' };
  public canEditEstablishment: boolean;
  public addWorkplaceDetailsBanner: boolean;
  public showCqcDetailsBanner: boolean;

  public workplace: Establishment;
  public workerCount: number;

  constructor(
    private alertService: AlertService,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private tabsService: SubsidiaryTabsService,
  ) {}

  ngOnInit(): void {
    this.tabsService.selectedTab = 'workplace';
    this.establishmentService.setInStaffRecruitmentFlow(false);
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.workplace = this.route.snapshot.data.establishment;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;
    this.addWorkplaceDetailsBanner = this.workplace.showAddWorkplaceDetailsBanner;
    this.canEditEstablishment = this.permissionsService.can(this.workplace?.uid, 'canEditEstablishment');
  }

  ngOnDestroy(): void {
    // need to manually remove breadcrumbs on tabs, because a
    // navigation event isn't called when going from one tab to another
    this.alertService.removeAlert();
    this.breadcrumbService.removeRoutes();
  }
}
