import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { GetChildWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigate-to-workplace-dropdown',
  templateUrl: './navigate-to-workplace-dropdown.component.html',
  styleUrls: ['./navigate-to-workplace-dropdown.component.scss'],
})
export class NavigateToWorkplaceDropdownComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public primaryWorkplace: Establishment;
  public childWorkplaces: Workplace[];
  public currentWorkplace: string;

  constructor(
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
    private tabsService: TabsService,
  ) {}

  ngOnInit() {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.currentWorkplace = this.primaryWorkplace.uid;
    this.getChildWorkplaces();

    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((establishment) => {
        this.currentWorkplace = establishment.uid;
      }),
    );
  }

  private getChildWorkplaces(): void {
    this.subscriptions.add(
      this.establishmentService
        .getChildWorkplaces(this.primaryWorkplace.uid)
        .subscribe((data: GetChildWorkplacesResponse) => {
          this.childWorkplaces = data.childWorkplaces;
        }),
    );
  }

  public navigateToWorkplace(selectedWorkplaceUid: string) {
    if (selectedWorkplaceUid === this.primaryWorkplace.uid) {
      this.parentSubsidiaryViewService.clearViewingSubAsParent();
      this.router.navigate(['/dashboard'], { fragment: 'home' });
    } else {
      this.parentSubsidiaryViewService.setViewingSubAsParent(selectedWorkplaceUid);
      const homeSlug = this.tabsService.homeTab.slug;

      // navigating twice to force reload when on subsidiary home page
      this.router.navigateByUrl(`/subsidiary`, { skipLocationChange: true }).then(() => {
        this.router.navigate(['/subsidiary', selectedWorkplaceUid, homeSlug]);
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
