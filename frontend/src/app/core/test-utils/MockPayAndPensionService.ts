import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PayAndPensionService } from '@core/services/pay-and-pension.service';

@Injectable()
export class MockPayAndPensionService extends PayAndPensionService {
  inPayAndPensionsMiniFlow: boolean = false;

  getInPayAndPensionsMiniFlow(): boolean {
    return this.inPayAndPensionsMiniFlow;
  }

  public static factory(inPayAndPensionsMiniFlow: boolean) {
    return (httpClient: HttpClient, router: Router) => {
      const service = new MockPayAndPensionService(httpClient, router);
      service.inPayAndPensionsMiniFlow = inPayAndPensionsMiniFlow;
      return service;
    };
  }

  public clearInPayAndPensionsMiniFlowWhenClickedAway(): void {}
}
