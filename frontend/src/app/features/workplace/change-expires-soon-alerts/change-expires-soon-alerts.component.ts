import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-expires-soon-alerts',
  templateUrl: './change-expires-soon-alerts.component.html',
})
export class ChangeExpiresSoonAlertsComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public expiresSoonDate: string;
  public workplaceUid: string;
  public returnUrl: URLStructure;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private backLinkService: BackLinkService,
    private router: Router,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.workplaceUid = this.route.snapshot.data.establishment.uid;
    this.expiresSoonDate = this.route.snapshot.data.expiresSoonAlertDate.expiresSoonAlertDate;
    this.setupForm();
    this.setReturnUrl();
    this.setBackLink();
  }

  public setupForm(): void {
    this.form = this.formBuilder.group({
      expiresSoonAlerts: this.formBuilder.control(this.expiresSoonDate),
    });
  }

  private setReturnUrl(): void {
    this.returnUrl = { url: ['/dashboard'], fragment: 'training-and-qualifications' };
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  public onSubmit(): void {
    const formValue = this.form.value.expiresSoonAlerts;
    this.subscriptions.add(
      this.establishmentService.setExpiresSoonAlertDates(this.workplaceUid, formValue).subscribe(
        () => this.onSuccess(formValue),
        (error) => this.onError(error),
      ),
    );
  }

  private async onSuccess(formValue: string): Promise<void> {
    await this.router.navigate(this.returnUrl.url, { fragment: this.returnUrl.fragment });

    this.alertService.addAlert({
      type: 'success',
      message: `'Expires soon' alerts set to ${formValue} days`,
    });
  }

  private onError(error): void {
    console.error(error.error);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
