import { Injectable } from "@angular/core"
import { HttpErrorResponse } from '@angular/common/http'

import { throwError } from 'rxjs'

import { MessageService } from "./message.service"
import { Message } from "../model/message.model"

@Injectable({
  providedIn: "root"
})
export class HttpErrorHandler {
  constructor(private messageService: MessageService) {}

  public handleHttpError(error: HttpErrorResponse) {
    const message = error.error instanceof ErrorEvent ?
      error.error.message : "Server error. Please try again later."

    this.messageService.add(new Message("error", message))
    return throwError(message)
  }
}
