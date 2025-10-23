import { Component, OnDestroy, OnInit } from '@angular/core';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-courses-login-message',
  templateUrl: './training-courses-login-message.component.html',
})
export class TrainingCoursesLoginMessage implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor(private userService: UserService, private previousRouteService: PreviousRouteService) {}

  ngOnInit(): void {
    const userUid = this.userService.loggedInUser.uid;

    if (this.previousRouteService.getPreviousPage() === 'login') {
      this.subscriptions.add(this.userService.updateTrainingCoursesMessageViewedQuantity(userUid).subscribe(() => {}));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
