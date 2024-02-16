import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParentSubsidiaryViewService {
  private viewingSubAsParent = false;
  private subsidiaryUid: string

  setViewingSubAsParent(subsidiaryUid: string) {
    this.subsidiaryUid = subsidiaryUid;
    this.viewingSubAsParent = true;
  }

  clearViewingSubAsParent() {
    this.subsidiaryUid = null;
    this.viewingSubAsParent = false;
  }

  getViewingSubAsParent() {
    return this.viewingSubAsParent;
  }

  getSubsidiaryUid() {
    return this.subsidiaryUid;
  }
}