import { Component, OnDestroy, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-courses-login-message',
  templateUrl: './training-courses-login-message.component.html',
})
export class TrainingCoursesLoginMessage implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canEditWorker: boolean;

  constructor(
    private userService: UserService,
    private previousRouteService: PreviousRouteService,
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    const userUid = this.userService.loggedInUser.uid;
    this.canEditWorker = this.permissionsService.can(this.establishmentService.establishment.uid, 'canEditWorker');

    if (this.previousRouteService.getPreviousPage() === 'login') {
      this.subscriptions.add(this.userService.updateTrainingCoursesMessageViewedQuantity(userUid).subscribe(() => {}));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
