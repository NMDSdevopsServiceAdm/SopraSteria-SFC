import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserDetails } from '@core/model/userDetails.model';
import { AuthService } from '@core/services/auth.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { IdleService } from '@core/services/idle.service';
import { UserService } from '@core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('header') public header: ElementRef;

  private subscriptions: Subscription = new Subscription();
  public fullname: string;
  public user: UserDetails;
  public showDropdown = false;

  constructor(
    private authService: AuthService,
    private idleService: IdleService,
    private userService: UserService,
    private benchmarksService: BenchmarksService
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.userService.loggedInUser$.subscribe(user => {
        this.user = user;
        this.fullname = user && user.fullname ? user.fullname.split(' ')[0] : null;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.benchmarksService.header = this.header;
  }

  public isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  public toggleMenu(): void {
    this.showDropdown = !this.showDropdown;
  }

  public signOut(event): void {
    event.preventDefault();
    this.idleService.clear();
    this.authService.logout();
  }
}
