import { ChangeDetectorRef, Component, OnDestroy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    standalone: false
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() isAlertPositionInside: boolean;
  @Input() linkTextForAlert: string;
  @Input() noFloatRight: boolean;
  @Output() notifyAlertLinkClicked = new EventEmitter();

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

  alertLinkClicked(event) {
    this.notifyAlertLinkClicked.emit(event);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
