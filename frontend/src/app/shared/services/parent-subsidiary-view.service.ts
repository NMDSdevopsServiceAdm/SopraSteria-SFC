import { Injectable, Output, EventEmitter } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable({
  providedIn: 'root'
})
export class ParentSubsidiaryViewService {
  // @Output() subsidiaryUidEmitter = new EventEmitter<string>();
  private subsidiaryUidSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private viewingSubAsParent = false;
  private subsidiaryUid: string
  private subsidiaryWorkplace: Establishment;

  constructor(
    private establishmentService: EstablishmentService,
  ) {}

  setViewingSubAsParent(subsidiaryUid: string) {
    this.subsidiaryUid = subsidiaryUid;
    this.viewingSubAsParent = true;
    // this.subsidiaryUidEmitter.emit(subsidiaryUid);
    this.subsidiaryUidSubject.next(subsidiaryUid);
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

  // Method to get the current UID as an observable
  getObservableSubsidiaryUid(): Observable<string> {
    return this.subsidiaryUidSubject.asObservable();
  }
}