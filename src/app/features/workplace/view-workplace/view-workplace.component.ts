import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DeleteWorkplaceDialogComponent } from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { DialogService } from '@core/services/dialog.service';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { LoggedInEstablishment } from '@core/model/logged-in.model';
import { ParentPermissions } from '@core/model/my-workplaces.model';
import { Subscription } from 'rxjs';
import { URLStructure } from '@core/model/url.model';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-view-workplace',
  templateUrl: './view-workplace.component.html',
})
export class ViewWorkplaceComponent implements OnInit, OnDestroy {
  public parentEstablishment: LoggedInEstablishment;
  public workplace: Establishment;
  public summaryReturnUrl: URLStructure;
  public staffPermission = ParentPermissions.WorkplaceAndStaff;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private dialogService: DialogService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.parentEstablishment = this.authService.establishment;
    this.workplace = this.route.snapshot.data.establishment;

    this.summaryReturnUrl = {
      url: ['/workplace', this.workplace.uid],
      fragment: 'workplace',
    };

    this.userService.updateReturnUrl({
      url: ['/workplace', this.workplace.uid],
    });
  }

  public checkPermission(permission: ParentPermissions) {
    return this.workplace.parentPermissions === permission;
  }

  public onDeleteWorkplace(event: Event): void {
    event.preventDefault();
    this.dialogService
      .open(DeleteWorkplaceDialogComponent, { workplaceName: this.workplace.name })
      .afterClosed.subscribe(deleteConfirmed => {
        if (deleteConfirmed) {
          this.deleteWorkplace();
        }
      });
  }

  private deleteWorkplace(): void {
    this.subscriptions.add(
      this.establishmentService.deleteWorkplace(this.workplace.uid).subscribe(
        () => {
          this.router.navigate(['workplace/view-my-workplaces']).then(() => {
            this.alertService.addAlert({ type: 'success', message: 'Workplace successfully deleted.' });
          });
        },
        () => {
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the workplace.',
          });
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
