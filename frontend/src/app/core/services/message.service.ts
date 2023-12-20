import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private _success$ = new BehaviorSubject<string[]>([]);
  private _info$ = new BehaviorSubject<string[]>([]);
  private _warning$ = new BehaviorSubject<string[]>([]);
  private _error$ = new BehaviorSubject<string[]>([]);

  private success: string[] = [];
  private info: string[] = [];
  private warning: string[] = [];
  private error: string[] = [];

  success$: Observable<string[]> = this._success$.asObservable();
  info$: Observable<string[]> = this._info$.asObservable();
  warning$: Observable<string[]> = this._warning$.asObservable();
  error$: Observable<string[]> = this._error$.asObservable();

  // DEPRECATED - use dedicated methods
  show(status, message) {
    switch (status) {
      case 'success':
        this.showSuccess(message);
        break;
      case 'info':
        this.showInfo(message);
        break;
      case 'warning':
        this.showWarning(message);
        break;
      case 'error':
        this.showError(message);
        break;
      default:
        throw new TypeError(`Unknown message type ${JSON.stringify(message)}!`);
    }
  }

  showSuccess(message) {
    this.success.push(message);
    this._success$.next(this.success);
  }

  showInfo(message) {
    this.info.push(message);
    this._info$.next(this.info);
  }

  showWarning(message) {
    this.warning.push(message);
    this._warning$.next(this.warning);
  }

  showError(message) {
    this.error.push(message);
    this._error$.next(this.error);
  }

  clearSuccess() {
    this.success = [];
    this._success$.next(this.success);
  }

  clearInfo() {
    this.info = [];
    this._info$.next(this.info);
  }

  clearWarning() {
    this.warning = [];
    this._warning$.next(this.warning);
  }

  clearError() {
    this.error = [];
    this._error$.next(this.error);
  }

  clearAll() {
    this.clearSuccess();
    this.clearInfo();
    this.clearWarning();
    this.clearError();
  }
}
