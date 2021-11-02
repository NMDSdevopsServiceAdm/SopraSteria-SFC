import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserToken } from '@core/model/auth.model';
import * as Sentry from '@sentry/browser';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import isNull from 'lodash/isNull';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, tap } from 'rxjs/operators';

import { EstablishmentService } from './establishment.service';
import { PermissionsService } from './permissions/permissions.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuthenticated$: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private _isOnAdminScreen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private jwt = new JwtHelperService();
  private previousUser: string;
  private previousToken: string = null;
  private redirect: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private establishmentService: EstablishmentService,
    private userService: UserService,
    private permissionsService: PermissionsService,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  public get isAutheticated$(): Observable<boolean> {
    return this._isAuthenticated$.asObservable().pipe(
      filter((authenticated) => !isNull(authenticated)),
      distinctUntilChanged(),
    );
  }

  public isAuthenticated(): boolean {
    const authenticated = this.token ? !this.jwt.isTokenExpired(this.token) : false;
    this._isAuthenticated$.next(authenticated);
    return this._isAuthenticated$.value;
  }

  public get isAdmin(): boolean {
    return this.isAuthenticated() && this.userInfo().role === 'Admin';
  }

  public get isOnAdminScreen$(): Observable<boolean> {
    return this._isOnAdminScreen$.asObservable();
  }

  public get isOnAdminScreen(): boolean {
    return this._isOnAdminScreen$.value;
  }

  public set isOnAdminScreen(isOnAdminScreen: boolean) {
    this._isOnAdminScreen$.next(isOnAdminScreen);
  }

  public get token() {
    return localStorage.getItem('auth-token');
  }

  public set token(token: string) {
    localStorage.setItem('auth-token', token);
  }

  public get redirectLocation(): string {
    return this.redirect;
  }

  public isPreviousUser(username: string) {
    return username === this.previousUser;
  }

  public clearPreviousUser(): void {
    this.previousUser = null;
  }

  public storeRedirectLocation(): void {
    this.redirect = this.router.routerState.snapshot.url;
  }

  public authenticate(username: string, password: string) {
    this.featureFlagsService.configCatClient.forceRefreshAsync();
    return this.http.post<any>('/api/login/', { username, password }, { observe: 'response' }).pipe(
      tap(
        (response) => {
          this.token = response.headers.get('authorization');
          Sentry.configureScope((scope) => {
            scope.setUser({
              id: response.body.uid,
            });
          });
        },
        (error) => console.error(error),
      ),
    );
  }

  public refreshToken() {
    return this.http
      .get<any>(`/api/login/refresh`, { observe: 'response' })
      .pipe(tap((response) => (this.token = response.headers.get('authorization'))));
  }

  public logout(): void {
    this.setPreviousUser();
    this.unauthenticate();
    this.router.navigate(['/logged-out']);
  }

  public logoutByUser(): void {
    this.http.post<any>(`/api/logout`, {}).subscribe(
      (data) => {
        this.logoutWithSurvey(data.showSurvey);
      },
      (error) => {
        this.logoutWithSurvey(false);
      },
    );
  }

  private logoutWithSurvey(showSurvey: boolean): void {
    const uid = this.userService.loggedInUser.uid;
    const wid = this.establishmentService.establishmentId;
    this.setPreviousUser();
    this.unauthenticate();
    if (showSurvey) {
      this.router.navigate(['/satisfaction-survey'], {
        queryParams: { wid, uid },
      });
    } else {
      this.router.navigate(['/logged-out']);
    }
  }

  public logoutWithoutRouting(): void {
    this.unauthenticate();
  }

  protected unauthenticate(): void {
    localStorage.clear();
    this._isAuthenticated$.next(false);
    this.userService.loggedInUser = null;
    this.userService.resetAgreedUpdatedTermsStatus = null;
    this.establishmentService.resetState();
    this.permissionsService.clearPermissions();
    Sentry.configureScope((scope) => {
      scope.setUser({
        id: '',
      });
    });
  }

  public setPreviousToken(): void {
    if (this.previousToken === null) this.previousToken = this.token;
  }

  public restorePreviousToken(): void {
    if (this.previousToken !== null) this.token = this.previousToken;
  }

  public getPreviousToken(): any {
    return this.jwt.decodeToken(this.previousToken);
  }

  protected setPreviousUser(): void {
    const data = this.jwt.decodeToken(this.token);
    this.previousUser = data && data.sub ? data.sub : null;
  }

  public userInfo(): UserToken {
    return this.jwt.decodeToken(this.token);
  }
}
