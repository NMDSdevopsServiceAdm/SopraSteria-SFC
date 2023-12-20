import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
})
export class AlertComponent implements OnInit, OnDestroy {
  public alert: Alert;
  private subscriptions: Subscription = new Subscription();

  constructor(private alertService: AlertService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscriptions.add(
      this.alertService.alert$.subscribe((alert) => {
        this.alert = alert;
        this.cd.detectChanges();
      }),
    );
  }

  remove() {
    this.alertService.removeAlert();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
