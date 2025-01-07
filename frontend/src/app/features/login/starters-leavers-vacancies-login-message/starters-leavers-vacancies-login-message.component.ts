import { Component, OnDestroy } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-starters-leavers-vacancies-login-message',
  templateUrl: './starters-leavers-vacancies-login-message.component.html',
})
export class StartersLeaversVacanciesLoginMessageComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor(private userService: UserService) {
    const userUid = this.userService.loggedInUser.uid;

    this.subscriptions.add(
      this.userService.updateSLVMessage(userUid).subscribe((res) => {
        () => {};
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
