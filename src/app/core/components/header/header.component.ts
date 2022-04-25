import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { UserService } from '@core/services/user.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public isOnAdminScreen: boolean;
  public fullname: string;
  public user: UserDetails;
  public showDropdown = false;
  public workplaceId: string;
  public wdfNewDesignFlag: boolean;

  constructor(
    private authService: AuthService,
    private idleService: IdleService,
    private userService: UserService,
    private establishmentService: EstablishmentService,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.getUser();
    this.onAdminScreen();

    this.wdfNewDesignFlag = await this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false);
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

  public isAdminUser(): boolean {
    return this.authService.isAdmin;
  }

  private onAdminScreen(): void {
    this.subscriptions.add(
      this.authService.isOnAdminScreen$.subscribe((isOnAdminScreen) => {
        this.isOnAdminScreen = isOnAdminScreen;

        this.getEstablishmentId();
      }),
    );
  }

  private getEstablishmentId(): void {
    this.workplaceId = this.establishmentService.establishmentId;
  }

  public toggleMenu(): void {
    this.showDropdown = !this.showDropdown;
  }

  public signOut(event: Event): void {
    event.preventDefault();
    this.idleService.clear();
    if (this.isAdminUser()) {
      this.authService.logout();
    } else {
      this.authService.logoutByUser();
    }
  }
}
