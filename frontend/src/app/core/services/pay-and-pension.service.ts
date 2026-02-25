import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class PayAndPensionService {
  private readonly _payAndPensionQuestionRevealText: string =
    'The information will be used by DHSC and other sector bodies to ensure the Fair Pay Agreement is based on accurate data. It will not be shared in any way that identifies your workplace or staff.'

  private _inPayAndPensionsMiniFlow: boolean = false

  constructor(private http: HttpClient) {}

  get payAndPensionQuestionRevealText(): string {
    return this._payAndPensionQuestionRevealText;
  }

  setInPayAndPensionsMiniFlow(status: boolean) {
    this._inPayAndPensionsMiniFlow = status
  }

  getInPayAndPensionsMiniFlow(): boolean {
    return this._inPayAndPensionsMiniFlow
  }

  clearInPayAndPensionsMiniFlow(){
    this._inPayAndPensionsMiniFlow = null;
  }

  public showSleepInsQuestions(payAndPensionsGroup: number): string {
    if (payAndPensionsGroup === 1 || payAndPensionsGroup === 2) {
      return 'workplace-offer-sleep-ins';
    }
    return null;
  }
}
