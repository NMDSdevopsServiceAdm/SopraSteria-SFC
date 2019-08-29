import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { GetWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
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
          this.workplaces = workplaces.subsidaries.establishments; // TODO: Filter out Workplaces with no permissions
          this.workplaces = orderBy(this.workplaces, ['wdf.overall', 'updated'], ['asc', 'desc']);

          this.totalEligible = filter(this.workplaces, workplace => workplace.wdf.overall).length;
          this.totalIneligible = this.workplaces.length - this.totalEligible;
        }
      })
    );
  }
}
