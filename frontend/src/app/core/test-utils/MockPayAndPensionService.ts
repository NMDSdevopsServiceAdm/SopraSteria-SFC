import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';

export const mockPayAndPensionsGroup2ProgressBarSections = ['Question 1', 'Question 2', 'Question 3'];
export const mockPayAndPensionsGroup1ProgressBarSections = mockPayAndPensionsGroup2ProgressBarSections.concat([
  'Question 4',
]);

@Injectable()
export class MockPayAndPensionService extends PayAndPensionService {
  inPayAndPensionsMiniFlow: boolean = false;
  private _showTravelTimePayQuestion: boolean = false;
  private _isGroup1: boolean = false;

  getInPayAndPensionsMiniFlow(): boolean {
    return this.inPayAndPensionsMiniFlow;
  }

  public static factory(overrides: any = {}) {
    return (httpClient: HttpClient, router: Router) => {
      const service = new MockPayAndPensionService(httpClient, router);
      service.inPayAndPensionsMiniFlow = overrides?.inPayAndPensionsMiniFlow;
      service._showTravelTimePayQuestion = overrides?.showTravelTimePayQuestion;
      service._isGroup1 = overrides?.isGroup1;
      return service;
    };
  }

  public clearInPayAndPensionsMiniFlowWhenClickedAway(): void {}

  public showTravelTimePayQuestion(): boolean {
    return this._showTravelTimePayQuestion ?? false;
  }

  public getPayAndPensionsMiniFlowProgressBarSections(): string[] {
    if (this._isGroup1) {
      return mockPayAndPensionsGroup1ProgressBarSections;
    }
    return mockPayAndPensionsGroup2ProgressBarSections;
  }
}
