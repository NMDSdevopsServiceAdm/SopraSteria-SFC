import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import {
  DataPermissions,
  GetChildWorkplacesResponse,
  Workplace,
  WorkplaceDataOwner,
} from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigate-to-workplace-dropdown',
  templateUrl: './navigate-to-workplace-dropdown.component.html',
  styleUrls: ['./navigate-to-workplace-dropdown.component.scss'],
  standalone: false,
})
export class NavigateToWorkplaceDropdownComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public parentWorkplace: Establishment;
  public childWorkplaces: Workplace[];
  public currentWorkplace: string;
  @Input() maxChildWorkplacesForDropdown: number;

  constructor(
    private router: Router,
    public parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
    private tabsService: TabsService,
  ) {}

  ngOnInit() {
    this.initialiseComponent();

    this.subscriptions.add(
      this.establishmentService.checkForChildWorkplaceChanges$.subscribe((workplaceHasBeenDeleted) => {
        if (workplaceHasBeenDeleted) {
          this.initialiseComponent();
          this.establishmentService.setCheckForChildWorkplaceChanges(false);
        }
      }),
    );
  }

  private initialiseComponent(): void {
    this.parentWorkplace = this.establishmentService.primaryWorkplace;
    this.currentWorkplace = this.parentWorkplace.uid;

    this.getChildWorkplaces();

    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((establishment) => {
        if (establishment) {
          this.currentWorkplace = establishment.uid;
          const updatedWorkplace = this.getUpdatedWorkplace(establishment);

          if (updatedWorkplace) {
            updatedWorkplace.name = establishment.name;
          }
        }
      }),
    );
  }

  public getUpdatedWorkplace(establishment) {
    if (this.parentWorkplace.uid === establishment.uid) {
      return this.parentWorkplace;
    }
    return this.childWorkplaces?.find((childWorkplace) => {
      return childWorkplace.uid === establishment.uid;
    });
  }

  private getChildWorkplaces(): void {
    this.subscriptions.add(
      this.establishmentService
        .getChildWorkplaces(this.parentWorkplace.uid, { getPendingWorkplaces: false })
        .subscribe((data: GetChildWorkplacesResponse) => {
          this.childWorkplaces = data.childWorkplaces?.filter((workplace) => {
            return !(
              workplace.dataOwner === WorkplaceDataOwner.Workplace && workplace.dataPermissions === DataPermissions.None
            );
          });
        }),
    );
  }

  public navigateToWorkplace(selectedWorkplaceUid: string): void {
    if (selectedWorkplaceUid === this.parentWorkplace.uid) {
      this.navigateToParentWorkplace();
    } else {
      this.navigateToSubsidiaryWorkplace(selectedWorkplaceUid);
    }
  }

  private navigateToParentWorkplace(): void {
    this.parentSubsidiaryViewService.clearViewingSubAsParent();
    this.router.navigateByUrl(`/subsidiary`, { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard'], { fragment: 'home' });
    });
  }

  private navigateToSubsidiaryWorkplace(selectedWorkplaceUid: string): void {
    this.parentSubsidiaryViewService.setViewingSubAsParent(selectedWorkplaceUid);
    const homeSlug = this.tabsService.homeTab.slug;

    // navigating twice to force reload when on subsidiary home page
    this.router.navigateByUrl(`/subsidiary`, { skipLocationChange: true }).then(() => {
      this.router.navigate(['/subsidiary', selectedWorkplaceUid, homeSlug]);
    });
  }

  public backToParentLinkClick(event: Event) {
    event.preventDefault();
    this.navigateToParentWorkplace();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
