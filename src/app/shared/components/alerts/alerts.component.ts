import { Component, OnInit } from '@angular/core';
import { Alert } from '@core/model/alerts.model';
import { AlertService } from '@core/services/alert.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
})
export class AlertsComponent implements OnInit {
  public alert$: BehaviorSubject<Alert>;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alert$ = this.alertService.alert$;
  }

  remove() {
    this.alertService.removeAlert();
  }
}
