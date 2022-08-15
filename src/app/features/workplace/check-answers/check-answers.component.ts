import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-check-answers',
  templateUrl: './check-answers.component.html',
})
export class CheckAnswersComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  public summaryReturnUrl: URLStructure;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private router: Router,
    private alertService: AlertService,
    public backService: BackService,
  ) {}

  ngOnInit(): void {
    this.getEstablishmentData();
  }
  public getEstablishmentData(): void {
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((establishment) => {
        this.establishment = establishment;
        this.summaryReturnUrl = { url: ['/workplace', establishment.uid, 'check-answers'] };
        this.setBackLink();
      }),
    );
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['/workplace', this.establishment.uid, 'sharing-data'] });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public showConfirmWorkplaceDetailsAlert(): void {
    this.router.navigate(['/dashboard'], { fragment: 'workplace' });
    this.alertService.addAlert({
      type: 'success',
      message: `You've confirmed the workplace details that you added`,
    });
  }
}
