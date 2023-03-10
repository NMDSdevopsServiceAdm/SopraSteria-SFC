import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-dashboard',
  templateUrl: './dashboard.component.html',
})
export class NewDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public selectedTab: string;
  public workplace: Establishment;
  public workerCount: number;
  public workers: Worker[];
  public canViewListOfWorkers: boolean;
  public staffLastUpdatedDate: string;

  constructor(
    private route: ActivatedRoute,
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.subscriptions.add(
      this.tabsService.selectedTab$.subscribe((selectedTab) => {
        this.selectedTab = selectedTab;
        this.cd.detectChanges();
      }),
    );

    if (this.workplace) {
      this.getPermissions();

      this.canViewListOfWorkers && this.setWorkersAndTrainingValues();
    }
  }

  private getPermissions(): void {
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
  }

  private setWorkersAndTrainingValues(): void {
    const { workers = [], workerCount = 0 } = this.route.snapshot.data.workers;
    this.workers = workers;
    this.workerCount = workerCount;
    this.getStaffLastUpdatedDate();
  }

  private getStaffLastUpdatedDate(): void {
    const lastUpdatedDates = this.workers.map((worker) => new Date(worker.updated).getTime());
    this.staffLastUpdatedDate = new Date(Math.max(...lastUpdatedDates)).toISOString();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
