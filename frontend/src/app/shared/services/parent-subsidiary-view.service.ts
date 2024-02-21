import { Injectable } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Subject } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable({
  providedIn: 'root'
})
export class ParentSubsidiaryViewService {
  private viewingSubAsParent = false;
  private subsidiaryUid: string
  private subsidiaryWorkplace: Establishment;

  constructor(
    private establishmentService: EstablishmentService,
  ) {}

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