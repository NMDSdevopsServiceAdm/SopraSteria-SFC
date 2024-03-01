import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { TabsService } from '@core/services/tabs.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-view-subsidiary-staff-records',
  templateUrl: './view-subsidiary-staff-records.component.html',
})
export class ViewSubsidiaryStaffRecordsComponent implements OnInit {
  public workplace: Establishment;
  public workers: Worker[];
  public workerCount: number;
  public createStaffResponse = null;
  public errors;
  public canAddWorker: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private permissionsService: PermissionsService,
    private workerService: WorkerService,
    private route: ActivatedRoute,
    private tabsService: TabsService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit(): void {
    this.tabsService.selectedTab = 'staff-records';
    this.breadcrumbService.show(JourneyType.SUBSIDIARY);
    this.workerService.setAddStaffRecordInProgress(false);
    this.createStaffResponse = this.workerService.getCreateStaffResponse();

    this.workers = this.route.snapshot.data.workers?.workers;
    this.workerCount = this.route.snapshot.data.workers?.workerCount;

    this.parentSubsidiaryViewService.getObservableSubsidiary().subscribe(subsidiaryWorkplace => {
      if (subsidiaryWorkplace) {
        this.workplace = subsidiaryWorkplace;
        this.canAddWorker = this.permissionsService.can(this.workplace.uid, 'canAddWorker');
      }
    });


  }
}
