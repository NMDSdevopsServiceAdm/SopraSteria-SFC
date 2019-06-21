import { Component, OnDestroy, OnInit } from '@angular/core';
import { Alert } from '@core/model/alerts.model';
import { AlertsService } from '@core/services/alerts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
})
export class AlertsComponent implements OnInit, OnDestroy {
  public alert: Alert;
  private subscriptions: Subscription = new Subscription();

  constructor(private alertService: AlertsService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.alertService.alert$.subscribe(alert => {
        this.alert = alert;
      })
    );
  }

  removeAlert() {
    this.alertService.removeAlert();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
