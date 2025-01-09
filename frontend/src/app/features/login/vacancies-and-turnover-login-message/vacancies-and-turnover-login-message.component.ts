import { Component, OnDestroy } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vacancies-and-turnover-login-message',
  templateUrl: './vacancies-and-turnover-login-message.component.html',
})
export class VacanciesAndTurnoverLoginMessage implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor(private userService: UserService) {
    this.subscriptions.add(this.userService.updateLastViewedVacanciesAndTurnoverLoginMessage().subscribe(() => {}));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
