import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-courses-login-message',
  templateUrl: './training-courses-login-message.component.html',
  standalone: false,
})
export class TrainingCoursesLoginMessage implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canEditWorker: boolean;
  public workplace: Establishment;
  public isDataOwner: boolean;

  constructor(
    private userService: UserService,
    private previousRouteService: PreviousRouteService,
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.establishment;
    const userUid = this.userService.loggedInUser.uid;

    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.isDataOwner = this.workplace?.dataOwner === WorkplaceDataOwner.Workplace;

    if (this.previousRouteService.getPreviousPage() === 'login') {
      this.subscriptions.add(this.userService.updateTrainingCoursesMessageViewedQuantity(userUid).subscribe(() => {}));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
