import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public isOnAdminScreen: boolean;
  public isAdminUser: boolean;
  public fullname: string;
  public user: UserDetails;
  public showDropdown = false;
  public workplace: Establishment;
  public userUrl: URLStructure;

  constructor(
    private authService: AuthService,
    private idleService: IdleService,
    private userService: UserService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.getUser();
    this.onAdminScreen();
    this.isAdminUser = this.authService.isAdmin;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getUser(): void {
    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe((user) => {
        this.user = user;
        this.fullname = user && user.fullname ? user.fullname.split(' ')[0] : null;
      }),
    );
  }

  public isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  private onAdminScreen(): void {
    this.subscriptions.add(
      this.authService.isOnAdminScreen$.subscribe((isOnAdminScreen) => {
        console.log(isOnAdminScreen);
        this.isOnAdminScreen = isOnAdminScreen;
        // this.getEstablishment();
      }),
    );
  }

  private getEstablishment(): void {
    // this.workplace = this.isOnAdminScreen ? null : this.establishmentService.establishment;
    console.log('*********** here ********');
    if (!this.isOnAdminScreen) {
      console.log('Here');
      this.workplace = this.establishmentService.establishment;
      const url = ['/workplace', this.workplace.uid, 'users'];
      this.userUrl = { url };
    } else {
      console.log('There');
      this.workplace = null;
      const url = ['/'];
      this.userUrl = { url };
    }
  }

  public toggleMenu(): void {
    this.showDropdown = !this.showDropdown;
  }

  public signOut(event: Event): void {
    event.preventDefault();
    this.idleService.clear();
    if (this.isAdminUser) {
      this.authService.logout();
    } else {
      this.authService.logoutByUser();
    }
  }
}
