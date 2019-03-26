import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, empty, Observable } from 'rxjs';
import { catchError, debounceTime, map, tap } from 'rxjs/operators';
import { EstablishmentService } from './establishment.service';
import { HttpErrorHandler } from './http-error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _userDetails$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public userDetails$: Observable<string> = this._userDetails$.asObservable();

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler,
    private establishmentService: EstablishmentService
  ) { }

  /*
   * GET /api/user/establishment/:establishmentId
   */
  getUsernameFromEstbId() {

    return this.http
      .get<any>(
        `/api/user/establishment/${this.establishmentService.establishmentId}`,
        EstablishmentService.getOptions()
      )
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  /*
   * GET /api/user/establishment/:establishmentId/:username
   */
  getUserDetails(username) {

    return this.http
      .get<any>(
        `/api/user/establishment/${this.establishmentService.establishmentId}/${username}`,
        EstablishmentService.getOptions()
      )
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  /*
   * PUT /api/user/establishment/:establishmentId/:username
   */
  updateUserDetails(username, data) {

    return this.http
      .put<any>(
        `/api/user/establishment/${this.establishmentService.establishmentId}/${username}`,
        data,
        EstablishmentService.getOptions()
      )
      .pipe(
        debounceTime(500),
        catchError(this.httpErrorHandler.handleHttpError)
      );
  }

  updateState(data) {
    this._userDetails$.next(data);
  }

}
