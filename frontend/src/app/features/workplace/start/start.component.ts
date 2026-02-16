import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  standalone: false,
})
export class StartComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  public returnLink: Array<string>;
  public returnUrl: URLStructure;
  private subscriptions: Subscription = new Subscription();
  private fragment: string;
  public isViewingSubAsParent: boolean;
  public continueUrl: Array<string>;

  constructor(
    public backService: BackService,
    private establishmentService: EstablishmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.establishmentService.establishment$.pipe(take(1)).subscribe((establishment) => {
        this.establishment = establishment;
      }),
    );

    this.fragment = history.state?.navigatedFromFragment;
    this.setBackLink();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setBackLink(): void {
    const returnTo = this.fragment ? this.fragment : 'home';
    this.backService.setBackLink({ url: ['/dashboard'], fragment: returnTo });
  }

  public onSubmit(event: Event): void {
    event.preventDefault();

    this.removeAddDetailsBanner();

    const nextRoute = this.establishmentService.buildPathForAddWorkplaceDetails(
      this.establishment.uid,
      'other-services',
    );

    this.router.navigate(nextRoute);
  }

  private removeAddDetailsBanner(): void {
    const data = { property: 'showAddWorkplaceDetailsBanner', value: false };

    this.establishmentService.updateSingleEstablishmentField(this.establishment.uid, data).subscribe((response) => {
      this.establishment.showAddWorkplaceDetailsBanner = response.data.showAddWorkplaceDetailsBanner;
      this.establishmentService.setState(this.establishment);
    });
  }
}
