import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { Workplace, GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-my-workplaces',
  templateUrl: './view-my-workplaces.component.html',
})
export class ViewMyWorkplacesComponent implements OnInit, OnDestroy {
  public establishment: LoggedInEstablishment | null;
  public workplaces: Workplace[] = [];
  public workplacesCount: number;
  private subscriptions: Subscription = new Subscription();

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
    this.getMyEstablishments();
  }

  private getMyEstablishments(): void {
    this.subscriptions.add(
      this.userService.getMyEstablishments().subscribe((workplaces: GetWorkplacesResponse) => {
        if (workplaces.subsidaries) {
          this.workplaces = workplaces.subsidaries.establishments;
          this.workplacesCount = workplaces.subsidaries.count;
        } else {
          this.workplaces = [];
          this.workplacesCount = 0;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
