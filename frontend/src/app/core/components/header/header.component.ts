import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { UserService } from '@core/services/user.service';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showNotificationsLink: boolean;
  private subscriptions: Subscription = new Subscription();
  public isOnAdminScreen = true;
  public users: Array<UserDetails>;
  public fullname: string;
  public user: UserDetails;
  public showDropdown = false;
  public workplaceId: string;

  constructor(
    private authService: AuthService,
    private idleService: IdleService,
    private userService: UserService,
    private establishmentService: EstablishmentService,
    private notificationsService: NotificationsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.getUser();
    this.setupUserSubscription();

    this.onAdminScreen();
    this.workplaceId && this.getUsers();
    this.showNotificationsLink && this.setUpNotificationSubscription();
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

  private setupUserSubscription(): void {
    this.subscriptions.add(
      this.userService.users$.subscribe((users) => {
        this.users = users;
      }),
    );
  }

  public getUsers(): void {
    this.userService
      .getAllUsersForEstablishment(this.workplaceId)
      .subscribe((users) => this.userService.updateUsers(users));
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

  private setUpNotificationSubscription(): void {
    // get latest notification after every 60 seconds
    this.subscriptions.add(
      interval(60000).subscribe(() => {
        if (this.workplaceId) {
          this.notificationsService.getAllNotifications(this.workplaceId).subscribe(
            (notifications) => {
              this.notificationsService.notifications = notifications.notifications;
            },
            (error) => {
              console.error(error.error);
            },
          );
        }
      }),
    );
  }

  get numberOfNewNotifications(): number {
    const newNotifications = this.notificationsService.notifications.filter((notification) => !notification.isViewed);
    return newNotifications.length;
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
