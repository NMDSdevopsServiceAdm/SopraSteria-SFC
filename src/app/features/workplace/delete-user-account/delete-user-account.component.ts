import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-delete-user-account',
  templateUrl: './delete-user-account.component.html',
})
export class DeleteUserAccountComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public flow: string;
  public user: UserDetails;
  public establishment: Establishment;
  public return: URLStructure;

  constructor(
    public backService: BackService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    const { pathname } = location;
    this.flow = pathname.substr(0, pathname.lastIndexOf('/'));
    this.user = this.route.snapshot.data.user;
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.setBackLink();
    this.subscriptions.add(
      this.userService.returnUrl$.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl ? returnUrl : { url: ['/dashboard'] };
      }),
    );
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: [this.flow] });
  }

  public onDeleteUser(): void {
    this.subscriptions.add(
      this.userService.deleteUser(this.establishment.uid, this.user.uid).subscribe(
        () => {
          console.log('Successfully deleted');
          this.router.navigate(this.return.url, { fragment: 'users' });
          this.alertService.addAlert({
            type: 'success',
            message: `${this.user.fullname} has been deleted as a user`,
          });
        },
        () => {
          console.log('Error with deletion');
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the user.',
          });
        },
      ),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
