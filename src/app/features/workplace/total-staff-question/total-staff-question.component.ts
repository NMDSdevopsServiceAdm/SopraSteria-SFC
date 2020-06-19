import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataSharingOptions } from '@core/model/data-sharing.model';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TotalStaffComponent } from '../../../shared/components/total-staff/total-staff.component';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-total-staff-question',
  templateUrl: './total-staff-question.component.html',
})
export class TotalStaffQuestionComponent extends Question implements OnInit, OnDestroy {
  public nextRoute: string[];
  public workplace: Establishment;

  constructor(
    protected router: Router,
    protected backService: BackService, 
    protected establishmentService: EstablishmentService,
    private totalStaffComponent: TotalStaffComponent
  ) {
    super(totalStaffComponent.formBuilder, router, backService, totalStaffComponent.errorSummaryService, establishmentService);
  }

  protected init(): void {
    this.totalStaffComponent.initTotalStaff(this.establishment.uid);
    
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'vacancies'];
    this.setPreviousRoute();
  }

  private setPreviousRoute(): void {
    this.previousRoute = this.establishment.share.with.includes(DataSharingOptions.LOCAL)
      ? ['/workplace', `${this.establishment.uid}`, 'sharing-data-with-local-authorities']
      : ['/workplace', `${this.establishment.uid}`, 'sharing-data'];
  }

  protected generateUpdateProps() {
    return {
      totalStaff: this.totalStaffComponent.form.value.totalStaff,
    };
  }

  protected updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService.postStaff(this.establishment.uid, props.totalStaff).subscribe(
        data => this._onSuccess(data),
        error => this.onError(error)
      )
    );
  }
}
