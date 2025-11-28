import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-vacancies-and-turnover-login-message',
    templateUrl: './vacancies-and-turnover-login-message.component.html',
    standalone: false
})
export class VacanciesAndTurnoverLoginMessage implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.subscriptions.add(this.userService.updateLastViewedVacanciesAndTurnoverMessage().subscribe(() => {}));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
