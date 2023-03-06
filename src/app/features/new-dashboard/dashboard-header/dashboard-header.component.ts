import { Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-dashboard-header',
  templateUrl: './dashboard-header.component.html',
})
export class NewDashboardHeaderComponent implements OnInit {
  public workplace: Establishment;
  public selectedTab: string;
  public showLastUpdatedDate: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService, private tabsService: TabsService) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.selectedTabSubscription();
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
}
