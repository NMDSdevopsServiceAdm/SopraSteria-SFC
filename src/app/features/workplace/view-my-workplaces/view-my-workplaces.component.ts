import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorDefinition } from '@core/model/errorSummary.model';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { Workplace, GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-my-workplaces',
  templateUrl: './view-my-workplaces.component.html',
})
export class ViewMyWorkplacesComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public establishment: LoggedInEstablishment | null;
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public workplaces: Workplace[] = [];
  public workplacesCount = 0;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private errorSummaryService: ErrorSummaryService
  ) {}

  ngOnInit() {
    this.establishment = this.authService.establishment;
    this.getEstablishments();
    this.setupServerErrorsMap();
  }

  public setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Service unavailable.',
      },
    ];
  }

  private getEstablishments(): void {
    this.subscriptions.add(
      this.userService.getEstablishments().subscribe(
        (workplaces: GetWorkplacesResponse) => {
          if (workplaces.subsidaries) {
            this.workplaces = workplaces.subsidaries.establishments;
            this.workplacesCount = workplaces.subsidaries.count;
          }
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
