import { Injectable } from '@angular/core';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Injectable()
export class MockParentSubsidiaryViewService extends ParentSubsidiaryViewService {
  public getViewingSubAsParent() {
    return false;
  }
}
