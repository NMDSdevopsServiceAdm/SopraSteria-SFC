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
    this.establishmentService.setInStaffRecruitmentFlow(false);
    this.tabsService.selectedTab = 'workplace';
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);

    this.route.snapshot.data.subsidiaryWorkplaceResolver.subscribe(data => {
      this.workplace = data.resolvedData;
      console.log("resolvedData: ", data.resolvedData);
    });

    this.parentSubsidiaryViewService.getObservableSubsidiary().subscribe(subsidiaryWorkplace => {
      if (subsidiaryWorkplace) {
        this.workplace = subsidiaryWorkplace;

        this.workerCount = this.route.snapshot.data.workers?.workerCount;
        this.addWorkplaceDetailsBanner = this.workplace.showAddWorkplaceDetailsBanner;
        this.canEditEstablishment = this.permissionsService.can(this.workplace?.uid, 'canEditEstablishment');
        this.establishmentService.setPrimaryWorkplace(this.workplace);

        // create nice logs for all the variables above
        console.log("subsidiaryWorkplace updated: ", this.workplace.updated);
        console.log("workerCount: ", this.workerCount);
      }
    });

    // this.establishmentService.getEstablishment(this.parentSubsidiaryViewService.getSubsidiaryUid())
    //   .subscribe((workplace) => {
    //     if (workplace) {
    //       this.establishmentService.setPrimaryWorkplace(workplace);
    //       this.workplace = workplace;

    //       // this.canEditEstablishment = this.permissionsService.can(this.workplace?.uid, 'canEditEstablishment');
    //       // this.addWorkplaceDetailsBanner = this.workplace.showAddWorkplaceDetailsBanner;
    //       // this.showCqcDetailsBanner = this.establishmentService.checkCQCDetailsBanner;
    //     }
    // });
  }
}
