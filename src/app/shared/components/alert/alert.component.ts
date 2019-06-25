import { Component, OnInit } from '@angular/core';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
})
export class AlertComponent implements OnInit {
  public alert$: BehaviorSubject<Alert>;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alert$ = this.alertService.alert$;
  }

  remove() {
    this.alertService.removeAlert();
  }
}
