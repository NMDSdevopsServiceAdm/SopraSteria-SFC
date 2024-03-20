import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { GetChildWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() parentWorkplaceName: string;
  private subscriptions: Subscription = new Subscription();
  public primaryWorkplace: Establishment;
  public childWorkplaces: Workplace[];

  constructor(
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit() {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.getChildWorkplaces();
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

  navigateToWorkplace(selectedWorkplaceUid: string) {
    if (selectedWorkplaceUid === this.primaryWorkplace.uid) {
      this.parentSubsidiaryViewService.clearViewingSubAsParent();
      this.router.navigate(['/dashboard']);
    } else {
      this.parentSubsidiaryViewService.setViewingSubAsParent(selectedWorkplaceUid);
      this.router.navigate(['/subsidiary', 'home', selectedWorkplaceUid]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
