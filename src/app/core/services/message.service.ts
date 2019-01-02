import { Injectable } from "@angular/core"

import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: "root"
})
export class MessageService {
  private _success$ = new BehaviorSubject<string>("")
  private _info$ = new BehaviorSubject<string>("")
  private _warning$ = new BehaviorSubject<string>("")
  private _error$ = new BehaviorSubject<string>("")

  success$: Observable<string> = this._success$.asObservable()
  info$: Observable<string> = this._info$.asObservable()
  warning$: Observable<string> = this._warning$.asObservable()
  error$: Observable<string> = this._error$.asObservable()

  show(status, message) {
    switch(status) {
      case "success": this._success$.next(message); break;
      case "info": this._info$.next(message); break;
      case "warning": this._warning$.next(message); break;
      case "error": this._error$.next(message); break;
      default: throw new TypeError(`Unknown message type ${JSON.stringify(message)}!`)
    }
  }

  clearSuccess() {
    this._success$.next("")
  }

  clearInfo() {
    this._info$.next("")
  }

  clearWarning() {
    this._warning$.next("")
  }

  clearError() {
    this._error$.next("")
  }

  clearAll() {
    this.clearSuccess()
    this.clearInfo()
    this.clearWarning()
    this.clearError()
  }
}
