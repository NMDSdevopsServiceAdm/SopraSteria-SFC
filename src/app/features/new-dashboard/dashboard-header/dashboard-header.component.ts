import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-dashboard-header',
  templateUrl: './dashboard-header.component.html',
})
export class NewDashboardHeaderComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  public selectedTab: string;
  public showLastUpdatedDate: boolean;
  private subscriptions: Subscription = new Subscription();
  public canAddWorker: boolean;
  public tabsMap = {
    workplace: 'Workplace',
    'staff-records': 'Staff records',
    'training-and-qualifications': 'Training and qualifications',
    benchmarks: 'Benchmarks',
  };

  constructor(
    private establishmentService: EstablishmentService,
    private tabsService: TabsService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.selectedTabSubscription();
    this.getPermissions();
  }

  private selectedTabSubscription(): void {
    this.subscriptions.add(
      this.tabsService.selectedTab$.subscribe((selectedTab) => {
        if (selectedTab !== 'home' && selectedTab !== 'benchmarks') {
          this.showLastUpdatedDate = true;
        } else {
          this.showLastUpdatedDate = false;
        }
        this.selectedTab = selectedTab;
      }),
    );
  }

  private getPermissions(): void {
    this.canAddWorker = this.permissionsService.can(this.workplace.uid, 'canAddWorker');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
