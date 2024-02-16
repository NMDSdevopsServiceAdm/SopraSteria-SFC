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
  public primaryWorkplaceName: string;

  ngOnInit(): void {
    this.primaryWorkplaceName = this.establishmentService.primaryWorkplace.name;
    const subId = this.parentSubsidiaryViewService.getSubsidiaryUid();
    console.log(subId);

    this.establishmentService.getEstablishment(subId);

    this.workplace = this.establishmentService.establishment;

    console.log(this.workplace);

    this.isParentSubsidiaryView = this.parentSubsidiaryViewService.getViewingSubAsParent();

    console.log(this.isParentSubsidiaryView);
  }
}
