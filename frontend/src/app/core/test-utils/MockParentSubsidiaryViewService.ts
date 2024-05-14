import { Injectable } from '@angular/core';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

import { MockEstablishmentService } from './MockEstablishmentService';

@Injectable()
export class MockParentSubsidiaryViewService extends ParentSubsidiaryViewService {
  private mockViewingSubAsParent: boolean = false;
  public static factory(viewingSubAsParent = false) {
    return (establishmentService: MockEstablishmentService) => {
      const service = new MockParentSubsidiaryViewService(establishmentService);
      service.mockViewingSubAsParent = viewingSubAsParent;
      return service;
    };
  }

  public getViewingSubAsParent() {
    return this.mockViewingSubAsParent;
  }

  public clearViewingSubAsParent(): void {}
}
