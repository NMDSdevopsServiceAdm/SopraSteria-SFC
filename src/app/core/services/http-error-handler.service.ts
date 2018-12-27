import { Injectable } from "@angular/core"
import { HttpErrorResponse } from '@angular/common/http'

import { throwError } from 'rxjs'

import { MessageService } from "./message.service"

@Injectable({
  providedIn: "root"
})
export class HttpErrorHandler {
  constructor(private messageService: MessageService) {
    this.handleHttpError = this.handleHttpError.bind(this)
  }

  handleHttpError(error: HttpErrorResponse) {
    const message = error.error instanceof ErrorEvent ?
      error.error.message : "Server error. Please try again later, sorry."

    this.messageService.show("error", message)
    return throwError(message)
  }
}
