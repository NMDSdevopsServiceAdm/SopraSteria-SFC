import { Component, OnInit, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { SharedModule } from '@shared/shared.module';
import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';
import { NewHomeTabDirective } from '@shared/directives/new-home-tab/new-home-tab.directive';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-view-subsidiary-home',
  templateUrl: './view-subsidiary-home.component.html',
  providers: [ServiceNamePipe],
})
export class ViewSubsidiaryHomeComponent extends NewHomeTabDirective {
  public parentWorkplaceName: string;
  public subId: string;
  public subsidiaryWorkplace: string;
  public primaryEstablishment: Establishment;
  public workplace: Establishment;
  public summaryReturnUrl: URLStructure;
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

  // constructor(
  //   private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  // ) {}

  ngOnInit(): void {
    this.parentWorkplaceName = this.establishmentService.primaryWorkplace.name;

    this.subId = this.parentSubsidiaryViewService.getSubsidiaryUid()
      ? this.parentSubsidiaryViewService.getSubsidiaryUid()
      : this.route.snapshot.params.subsidiaryId;

    console.log(this.route.snapshot);

    this.subsidiaryWorkplace = this.route.snapshot.data.subsidiaryResolver;

    console.log(this.workplace);

    console.log(this.canViewEstablishment);

    //this.establishmentService.getEstablishment(this.subId);

    //console.log(this.route.snapshot);

    // this.establishmentService.getEstablishment(this.subId).subscribe((data) => {
    //   this.workplace = data;
    // });

    console.log(this.canEditEstablishment);

    //this.subsidiaryWorkplace = this.establishmentService.establishment;

    //this.handlePageRefresh();
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();

    console.log(this.isParentSubsidiaryView);
  }

  ngOnChanges(): void {
    this.setPermissionLinks();
  }

  public handlePageRefresh(): void {
    console.log('function');
    this.parentSubsidiaryViewService.setViewingSubAsParent(this.subId);
    // this.establishmentService.setCheckCQCDetailsBanner(false);
    // this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    // this.workplace = this.establishmentService.establishment;
    // this.canViewBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    // this.canViewListOfUsers = this.permissionsService.can(this.workplace.uid, 'canViewListOfUsers');
    // this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    // this.canDeleteEstablishment = this.permissionsService.can(this.workplace.uid, 'canDeleteEstablishment');
    // this.newDataAreaFlag = this.featureFlagsService.newBenchmarksDataArea;
    // this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
  }
}
