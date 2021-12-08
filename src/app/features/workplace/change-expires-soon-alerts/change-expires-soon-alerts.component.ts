import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-expires-soon-alerts',
  templateUrl: './change-expires-soon-alerts.component.html',
})
export class ChangeExpiresSoonAlertsComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public expiresSoonDate: string;
  private workplaceUid: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private backService: BackService,
    private router: Router,
    private alertService: AlertService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.workplaceUid = this.route.snapshot.data.establishment.uid;
    this.expiresSoonDate = this.route.snapshot.data.expiresSoonAlertDate.expiresSoonAlertDate;
    this.setupForm();
    this.setBackLink();
  }

  public setupForm(): void {
    this.form = this.formBuilder.group({
      expiresSoonAlerts: this.formBuilder.control(this.expiresSoonDate),
    });
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['dashboard'], fragment: 'training-and-qualifications' });
  }

  public onSubmit(): void {
    const formValue = this.form.value.expiresSoonAlerts;
    this.subscriptions.add(
      this.establishmentService
        .setExpiresSoonAlertDates(this.workplaceUid, { expiresSoonAlertDates: formValue })
        .subscribe(
          () => this.onSuccess(formValue),
          (error) => this.onError(error),
        ),
    );
  }

  private async onSuccess(formValue: string): Promise<void> {
    await this.router.navigate(['dashboard'], { fragment: 'training-and-qualifications' });

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
