import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-view-subsidiary-workplace',
  templateUrl: './view-subsidiary-workplace.component.html',
})
export class ViewSubsidiaryWorkplaceComponent implements OnInit {
  // public summaryReturnUrl: URLStructure = { url: ['/dashboard'], fragment: 'workplace' };
  public canEditEstablishment: boolean;
  public addWorkplaceDetailsBanner: boolean;
  public showCqcDetailsBanner: boolean;
  public isParentViewingSubsidiary: boolean;

  public workplace: Establishment;
  public workerCount: number;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private tabsService: TabsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isParentViewingSubsidiary = true; // TODO use original component and use this to differentiate
    this.establishmentService.setInStaffRecruitmentFlow(false);
    this.tabsService.selectedTab = 'workplace';
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);

    this.parentSubsidiaryViewService.getObservableSubsidiary().subscribe(subsidiaryWorkplace => {
      if (subsidiaryWorkplace) {
        this.workplace = subsidiaryWorkplace;

        this.workerCount = this.route.snapshot.data.workers?.workerCount;
        this.addWorkplaceDetailsBanner = this.workplace.showAddWorkplaceDetailsBanner;
        this.canEditEstablishment = this.permissionsService.can(this.workplace?.uid, 'canEditEstablishment');
        this.establishmentService.setPrimaryWorkplace(this.workplace);
      }
    });
  }
}
