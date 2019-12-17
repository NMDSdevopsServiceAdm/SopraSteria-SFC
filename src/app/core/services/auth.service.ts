import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { isNull } from 'lodash';
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
  private jwt = new JwtHelperService();
  private previousUser: string;
  private redirect: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private establishmentService: EstablishmentService,
    private userService: UserService,
    private permissionsService: PermissionsService
  ) {}

  public get isAutheticated$(): Observable<boolean> {
    return this._isAuthenticated$.asObservable().pipe(
      filter(authenticated => !isNull(authenticated)),
      distinctUntilChanged()
    );
  }

  public isAuthenticated(): boolean {
    const authenticated = this.token ? !this.jwt.isTokenExpired(this.token) : false;
    this._isAuthenticated$.next(authenticated);
    return this._isAuthenticated$.value;
  }

  public get token() {
    console.log('Getting the token from localStorage');
    return localStorage.getItem('auth-token');
  }

  public set token(token: string) {
    console.log('Setting the token in localStorage');
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
    console.log('Authservice has been asked to authenticate a user');
    return this.http.post<any>('/api/login/', { username, password }, { observe: 'response' }).pipe(
      tap(
        response => (this.token = response.headers.get('authorization')),
        error => console.error(error)
      )
    );
  }

  public refreshToken() {
    return this.http
      .get<any>(`/api/login/refresh`, { observe: 'response' })
      .pipe(tap(response => (this.token = response.headers.get('authorization'))));
  }

  public logout(): void {
    this.setPreviousUser();
    this.unauthenticate();
    this.router.navigate(['/logged-out']);
  }

  public logoutWithoutRouting(): void {
    this.unauthenticate();
  }

  private unauthenticate(): void {
    localStorage.clear();
    this._isAuthenticated$.next(false);
    this.userService.loggedInUser = null;
    this.userService.resetAgreedUpdatedTermsStatus = null;
    this.establishmentService.resetState();
    this.permissionsService.clearPermissions();
  }

  private setPreviousUser(): void {
    const data = this.jwt.decodeToken(this.token);
    this.previousUser = data && data.sub ? data.sub : null;
  }
}
