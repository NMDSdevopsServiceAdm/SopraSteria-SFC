import { Component, OnInit } from '@angular/core';
import { Alert } from '@core/model/alerts.model';
import { AlertsService } from '@core/services/alerts.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
})
export class AlertsComponent implements OnInit {
  public alert$: BehaviorSubject<Alert>;

  constructor(private alertsService: AlertsService) {}

  ngOnInit() {
    this.alert$ = this.alertsService.alert$;
  }

  remove() {
    this.alertsService.removeAlert();
  }
}
