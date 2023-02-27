import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-dashboard',
  templateUrl: './dashboard.component.html',
})
export class NewDashboardComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public selectedTab: string;
  public workplace: Establishment;

  constructor(
    private tabsService: TabsService,
    private establishmentService: EstablishmentService,
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
  }
}
