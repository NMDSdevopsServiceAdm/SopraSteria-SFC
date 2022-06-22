import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
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
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((establishment) => {
        this.establishment = establishment;
        this.summaryReturnUrl = { url: ['/workplace', establishment.uid, 'check-answers'] };
      }),
    );
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
