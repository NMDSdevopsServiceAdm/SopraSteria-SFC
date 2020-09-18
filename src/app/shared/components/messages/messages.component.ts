import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '@core/services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
})
export class MessagesComponent implements OnInit, OnDestroy {
  public success: any;
  public info: any;
  public warning: any;
  public error: any;
  private subscriptions = [];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.subscriptions.push(this.messageService.success$.subscribe((success) => (this.success = success)));
    this.subscriptions.push(this.messageService.info$.subscribe((info) => (this.info = info)));
    this.subscriptions.push(this.messageService.warning$.subscribe((warning) => (this.warning = warning)));
    this.subscriptions.push(this.messageService.error$.subscribe((error) => (this.error = error)));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.messageService.clearAll();
  }
}
