import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-account-saved',
  templateUrl: './user-account-saved.component.html',
})
export class UserAccountSavedComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  public workplace: Establishment;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
  ) {}

  // public returnUrl$: Observable<URLStructure>;
  public userDetails: UserDetails = this.route.snapshot.data.user;
  public return: URLStructure;

  ngOnInit() {
    this.workplace = this.establishmentService.primaryWorkplace;
    this.subscriptions.add(
      this.userService.returnUrl.pipe(take(1)).subscribe((returnUrl) => {
        this.return = returnUrl;
      }),
    );
  }
}
