import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { SharedModule } from '@shared/shared.module';
import { ServiceNamePipe } from '@shared/pipes/service-name.pipe';
import { NewHomeTabDirective } from '@shared/directives/new-home-tab/new-home-tab.directive';

@Component({
  selector: 'app-view-subsidiary-home',
  templateUrl: './view-subsidiary-home.component.html',
  providers: [ServiceNamePipe],
})
export class ViewSubsidiaryHomeComponent extends NewHomeTabDirective {
  public parentWorkplaceName: string;
  public subId: string;
  public subsidiaryWorkplace: string;

  ngOnInit(): void {
    this.parentWorkplaceName = this.establishmentService.primaryWorkplace.name;

    this.subId = this.parentSubsidiaryViewService.getSubsidiaryUid()
      ? this.parentSubsidiaryViewService.getSubsidiaryUid()
      : this.route.snapshot.params.subsidiaryId;

    //this.establishmentService.getEstablishment(this.subId);

    //console.log(this.route.snapshot);

    // this.establishmentService.getEstablishment(this.subId).subscribe((data) => {
    //   this.workplace = data;
    // });

    this.establishmentService.getEstablishment(this.subId).subscribe((workplace) => {
      if (workplace) {
        this.establishmentService.setPrimaryWorkplace(workplace);
        this.subsidiaryWorkplace = workplace;
        this.workplace = workplace;
        console.log(this.subsidiaryWorkplace);
        console.log(this.establishmentService.primaryWorkplace);
        this.setPermissionLinks();
      }
    });

    console.log(this.canEditEstablishment);

    //this.subsidiaryWorkplace = this.establishmentService.establishment;

    this.handlePageRefresh();
    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();

    console.log(this.isParentSubsidiaryView);
  }

  public handlePageRefresh(): void {
    console.log('function');
    this.parentSubsidiaryViewService.setViewingSubAsParent(this.subId);
  }
}
