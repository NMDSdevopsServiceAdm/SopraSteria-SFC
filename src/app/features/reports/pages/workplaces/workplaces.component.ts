import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { DataPermissions, GetWorkplacesResponse, Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { UserService } from '@core/services/user.service';
import { filter, orderBy } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workplaces',
  templateUrl: './workplaces.component.html',
})
export class WorkplacesComponent implements OnInit {
  public workplaces: Workplace[] = [];
  public totalEligible: number;
  public totalIneligible: number;
  private subscriptions: Subscription = new Subscription();

  constructor(private breadcrumbService: BreadcrumbService, private userService: UserService) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.REPORTS);

    this.subscriptions.add(
      this.userService.getEstablishments(true).subscribe((workplaces: GetWorkplacesResponse) => {
        if (workplaces.subsidaries) {
          this.workplaces = workplaces.subsidaries.establishments;

          if (this.workplaces.length) {
            this.workplaces = filter(this.workplaces, this.exclusionCheck);
          }

          this.workplaces = orderBy(this.workplaces, ['wdf.overall', 'updated'], ['asc', 'desc']);

          this.totalEligible = filter(this.workplaces, workplace => workplace.wdf.overall).length;
          this.totalIneligible = this.workplaces.length - this.totalEligible;
        }
      })
    );
  }

  /**
   * Exclude if dataOwner is 'Workplace' with no data permissions
   * @param w - Workplace
   */
  private exclusionCheck(w: Workplace): boolean {
    return w.dataOwner === WorkplaceDataOwner.Workplace && w.dataPermissions === DataPermissions.None ? false : true;
  }
}
