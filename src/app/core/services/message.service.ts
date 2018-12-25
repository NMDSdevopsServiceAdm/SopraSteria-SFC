import { Injectable } from "@angular/core"

import { from, Observable } from 'rxjs'

@Injectable({
  providedIn: "root"
})
export class MessageService {
  private success: string[] = []
  private info: string[] = []
  private warning: string[] = []
  private error: string[] = []

  public success$: Observable<string> = from(this.success)
  public info$: Observable<string> = from(this.info)
  public warning$: Observable<string> = from(this.warning)
  public error$: Observable<string> = from(this.error)

  add({ status, message }) {
    switch(status) {
      case "success": this.success.push(message); break;
      case "info": this.info.push(message); break;
      case "warning": this.warning.push(message); break;
      case "error": this.error.push(message); break;
      default: throw new TypeError(`Unknown message type ${JSON.stringify(message)}!`)
    }

    return this
  }

  clearSuccess() {
    this.success.splice(0)
  }

  clearInfo() {
    this.info.splice(0)
  }

  clearWarning() {
    this.warning.splice(0)
  }

  clearError() {
    this.error.splice(0)
  }

  clearAll() {
    this.clearSuccess()
    this.clearInfo()
    this.clearWarning()
    this.clearError()
  }
}
