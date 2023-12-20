import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-staff-recruitment-start',
  templateUrl: './staff-recruitment-start.component.html',
})
export class StaffRecruitmentStartComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  public primaryWorkplaceUid: string;
  public returnLink: Array<string>;
  public returnUrl: URLStructure;
  private subscriptions: Subscription = new Subscription();
  private workplaceUid: string;
  private fragment: string;

  constructor(public backService: BackService, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.establishmentService.establishment$.pipe(take(1)).subscribe((establishment) => {
        this.establishment = establishment;
      }),
    );

    this.establishmentService.setInStaffRecruitmentFlow(true);

    this.fragment = history.state?.navigatedFromFragment;
    this.setReturnLink();
    this.setBackLink();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setReturnLink(): void {
    this.returnLink =
      this.workplaceUid === this.primaryWorkplaceUid ? ['/dashboard'] : ['/staff-recruitment', this.workplaceUid];
  }

  public setBackLink(): void {
    const returnTo = this.fragment ? this.fragment : 'home';
    this.backService.setBackLink({ url: this.returnLink, fragment: returnTo });
  }
}
