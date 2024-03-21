import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-delete-workplace',
  templateUrl: '/delete-workplace.component.html',
})
export class DeleteWorkplaceComponent implements OnInit, OnChanges {
  public subsidiaryWorkplace: Establishment;
  public parentWorkplace: Establishment;
  public canDeleteEstablishment: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private breadcrumbService: BreadcrumbService,
  ) {}
  ngOnInit(): void {
    this.subsidiaryWorkplace = this.route.snapshot.data.establishment;
    //this.breadcrumbService.show(JourneyType.DELETE_WORKPLACE);
    //this.handlePageRefresh();
  }

  ngOnChanges(): void {
    //this.handlePageRefresh();
  }

  public handlePageRefresh(): void {
    if (!this.parentSubsidiaryViewService.getViewingSubAsParent()) {
      this.parentSubsidiaryViewService.setViewingSubAsParent(this.route.snapshot.params.establishmentuid);
      this.router.navigate(['/delete-workplace/', this.subsidiaryWorkplace.uid]);
    }
  }
}
