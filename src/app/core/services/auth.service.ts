import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs/operators';

import { EstablishmentService } from './establishment.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private jwt = new JwtHelperService();
  public redirect: string;
  private previousUser: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private establishmentService: EstablishmentService,
    private userService: UserService
  ) {}

  public isAuthenticated(): boolean {
    return this.token ? !this.jwt.isTokenExpired(this.token) : false;
  }

  public get token() {
    return localStorage.getItem('auth-token');
  }

  public set token(token: string) {
    localStorage.setItem('auth-token', token);
  }

  public isPreviousUser(username: string) {
    return username === this.previousUser;
  }

  public clearPreviousUser(): void {
    this.previousUser = null;
  }

  public authenticate(username: string, password: string) {
    return this.http
      .post<any>('/api/login/', { username, password }, { observe: 'response' })
      .pipe(tap(response => (this.token = response.headers.get('authorization'))));
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
    this.userService.loggedInUser = null;
    this.establishmentService.resetState();
  }

  private setPreviousUser(): void {
    const data = this.jwt.decodeToken(this.token);
    this.previousUser = data.sub;
  }
}
