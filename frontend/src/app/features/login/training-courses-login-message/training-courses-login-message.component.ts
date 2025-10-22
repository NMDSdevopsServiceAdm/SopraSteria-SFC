import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-courses-login-message',
  templateUrl: './training-courses-login-message.component.html',
})
export class TrainingCoursesLoginMessage implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const userUid = this.userService.loggedInUser.uid;
    this.subscriptions.add(this.userService.updateTrainingCoursesMessageViewedQuantity(userUid).subscribe(() => {}));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
