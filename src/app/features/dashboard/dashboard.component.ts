import { Component, OnInit } from '@angular/core';
import { LoggedInEstablishment, LoggedInSession } from '@core/model/logged-in.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { take } from 'rxjs/operators';
import { Roles } from '@core/model/roles.enum';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public establishment: LoggedInEstablishment | null;
  public lastLoggedIn: string | null;
  public role: Roles;

  constructor(
    private establishmentService: EstablishmentService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    this.establishmentService.establishment$.pipe(take(1)).subscribe(establishment => {
      this.establishment = establishment;
    })

    this.authService.auth$.pipe(take(1)).subscribe((loggedInSession: LoggedInSession) => {


      if (loggedInSession && loggedInSession.role === 'Admin') {
        if (!this.establishment) {
          this.router.navigate(['/search-users']);
          return false;
        } else {

          const workplaceId = localStorage.getItem('establishmentId');

          this.establishmentService
            .getEstablishment(workplaceId)
            .pipe(take(1))
            .subscribe(establishment => {
              this.establishment = establishment;
            })
        }
      }
    })

    this.lastLoggedIn = this.authService.lastLoggedIn;

    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'user-accounts',
    });
  }
}
