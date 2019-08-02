import { Component, OnInit } from '@angular/core';
import { CreateAccountService } from '@core/services/create-account/create-account.service';

@Component({
  selector: 'app-activation-complete',
  templateUrl: './activation-complete.component.html',
})
export class ActivationCompleteComponent implements OnInit {
  constructor(private createAccountService: CreateAccountService) {}

  ngOnInit(): void {
    this.createAccountService.activationComplete$.next(true);
    this.createAccountService.setReturnTo(null);
    this.createAccountService.userDetails$.next(null);
  }
}
