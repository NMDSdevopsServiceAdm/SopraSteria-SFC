import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PayAndPensionService {
  private readonly _payAndPensionQuestionRevealText: string =
    'The information will be used by DHSC and other sector bodies to ensure the Fair Pay Agreement is based on accurate data. It will not be shared in any way that identifies your workplace or staff.';

  private _inPayAndPensionsMiniFlow: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  get payAndPensionQuestionRevealText(): string {
    return this._payAndPensionQuestionRevealText;
  }

  setInPayAndPensionsMiniFlow(status: boolean) {
    this._inPayAndPensionsMiniFlow = status;
  }

  getInPayAndPensionsMiniFlow(): boolean {
    return this._inPayAndPensionsMiniFlow;
  }

  clearInPayAndPensionsMiniFlow() {
    this._inPayAndPensionsMiniFlow = null;
  }

  public showSleepInsQuestions(payAndPensionsGroup: number): boolean {
    if (payAndPensionsGroup === 1 || payAndPensionsGroup === 2) {
      return true;
    }
    return false;
  }

  public showTravelTimePayQuestion(payAndPensionsGroup: number): boolean {
    return payAndPensionsGroup === 1;
  }

  public clearInPayAndPensionsMiniFlowWhenClickedAway(): void {
    const parentPath = 'workplace-data';

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => !event.urlAfterRedirects?.includes(parentPath)),
        take(1),
      )
      .subscribe(() => {
        this.setInPayAndPensionsMiniFlow(null);
      });
  }
}
