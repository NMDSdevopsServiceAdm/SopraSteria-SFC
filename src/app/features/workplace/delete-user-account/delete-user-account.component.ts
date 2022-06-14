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
    public userService: UserService,
    private router: Router,
    public alertService: AlertService,
  ) {}

  ngOnInit(): void {
    const { url } = this.router;
    this.flow = url.substr(0, url.lastIndexOf('/'));
    this.user = this.route.snapshot.data.user;
    this.establishment = this.route.parent.snapshot.data.establishment;
    this.setBackLink();
    this.subscriptions.add(
      this.userService.returnUrl.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl;
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
          this.router.navigate(this.return.url, { fragment: this.return.fragment });
          this.successAlert();
        },
        () => {
          this.errorAlert();
        },
      ),
    );
  }

  private successAlert(): void {
    this.alertService.addAlert({
      type: 'success',
      message: `${this.user.fullname} has been deleted as a user`,
    });
  }

  private errorAlert(): void {
    this.alertService.addAlert({
      type: 'warning',
      message: 'There was an error deleting the user',
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
