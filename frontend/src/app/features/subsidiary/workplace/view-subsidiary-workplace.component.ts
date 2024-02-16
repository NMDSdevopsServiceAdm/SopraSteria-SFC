import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-view-subsidiary-workplace',
  templateUrl: './view-subsidiary-workplace.component.html',
})
export class ViewSubsidiaryWorkplaceComponent implements OnInit {
  // @Input() newDashboard: boolean;

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

  constructor(
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    // this.showBanner = history.state?.showBanner;
    // this.establishmentService.setCheckCQCDetailsBanner(false);
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.primaryEstablishment = this.establishmentService.primaryWorkplace;
    this.workplace = this.establishmentService.establishment;
    // this.canViewBenchmarks = this.permissionsService.can(this.workplace.uid, 'canViewBenchmarks');
    // this.canViewListOfUsers = this.permissionsService.can(this.workplace.uid, 'canViewListOfUsers');
    // this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    // this.canDeleteEstablishment = this.permissionsService.can(this.workplace.uid, 'canDeleteEstablishment');
    // this.newDataAreaFlag = this.featureFlagsService.newBenchmarksDataArea;
    // this.canSeeNewDataArea = [1, 2, 8].includes(this.workplace.mainService.reportingID);
  }
}
