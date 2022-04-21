import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-cannot-create-account',
  templateUrl: './cannot-create-account.component.html',
})
export class CannotCreateAccountComponent implements OnInit {
  constructor(public backService: BackService) {}

  ngOnInit(): void {
    this.setBackLink();
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['./registration', 'your-workplace'] });
  }
}
