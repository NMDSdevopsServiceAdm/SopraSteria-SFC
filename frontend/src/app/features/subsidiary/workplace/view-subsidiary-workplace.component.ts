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
  public summaryReturnUrl: URLStructure = { url: ['/dashboard'], fragment: 'workplace' };
  public canEditEstablishment: boolean;
  public addWorkplaceDetailsBanner: boolean;
  public showCqcDetailsBanner: boolean;

  public primaryEstablishment: Establishment;
  public subsidiaryWorkplace: Establishment;
  public canDeleteEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public canViewBenchmarks: boolean;
  public totalStaffRecords: number;
  public trainingAlert: number;
  public workers: Worker[];
  public trainingCounts: TrainingCounts;
  public workerCount: number;
  public showSharingPermissionsBanner: boolean;
  private showBanner = false;
  public newDataAreaFlag: boolean;
  public canSeeNewDataArea: boolean;

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
      this.subsidiaryWorkplace = data.resolvedData;
      console.log("resolvedData: ", data.resolvedData);
    });

    // this.subsidiaryWorkplace = this.route.snapshot.data.subsidiaryWorkplaceResolver;
    this.workers = this.route.snapshot.data.workers?.workers;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;
    this.trainingCounts = this.route.snapshot.data.workers?.trainingCounts;

    this.addWorkplaceDetailsBanner = this.subsidiaryWorkplace.showAddWorkplaceDetailsBanner;
    this.canEditEstablishment = this.permissionsService.can(this.subsidiaryWorkplace?.uid, 'canEditEstablishment');

    this.establishmentService.setPrimaryWorkplace(this.subsidiaryWorkplace);

    // create nice logs for all the variables above
    console.log("subsidiaryWorkplace updated: ", this.subsidiaryWorkplace.updated);
    console.log("workers: ", this.workers);
    console.log("workerCount: ", this.workerCount);
    console.log("trainingCounts: ", this.trainingCounts);

    // this.route.data.subscribe(data => {
    //   this.subsidiaryWorkplace = data.resolvedData;
    //   console.log("resolvedData: ", data.resolvedData);
    // });

    // this.establishmentService.getEstablishment(this.parentSubsidiaryViewService.getSubsidiaryUid())
    //   .subscribe((workplace) => {
    //     if (workplace) {
    //       this.establishmentService.setPrimaryWorkplace(workplace);
    //       this.subsidiaryWorkplace = workplace;

    //       this.canEditEstablishment = this.permissionsService.can(this.subsidiaryWorkplace?.uid, 'canEditEstablishment');
    //       this.addWorkplaceDetailsBanner = this.subsidiaryWorkplace.showAddWorkplaceDetailsBanner;
    //       this.showCqcDetailsBanner = this.establishmentService.checkCQCDetailsBanner;
    //     }
    // });
  }
}
