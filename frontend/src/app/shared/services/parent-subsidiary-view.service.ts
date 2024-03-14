import { Injectable } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable({
  providedIn: 'root'
})
export class ParentSubsidiaryViewService {
  private subsidiaryUidSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private subsidiaryWorkplace: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  private _canShowBanner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private viewingSubAsParent = false;
  private subsidiaryUid: string

  constructor(
    private establishmentService: EstablishmentService,
  ) {}

  setViewingSubAsParent(subsidiaryUid: string) {
    this.subsidiaryUid = subsidiaryUid;
    this.viewingSubAsParent = true;
    this.subsidiaryUidSubject.next(subsidiaryUid);

    this.establishmentService.getEstablishment(subsidiaryUid)
    .subscribe((workplace) => {
      if (workplace) {
        this.establishmentService.setPrimaryWorkplace(workplace);
        this.establishmentService.setWorkplace(workplace);
        this.subsidiaryWorkplace.next(workplace);
        console.log("parentSubsidiaryViewService Workplace: ", workplace);
      }
    });
  }

  clearViewingSubAsParent() {
    this.subsidiaryUid = null;
    this.viewingSubAsParent = false;
    this.subsidiaryUidSubject.next("");
    this.subsidiaryWorkplace.next(null);
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

  // Method to get the current subsidiary as an observable
  getObservableSubsidiary(): Observable<Establishment> {
    return this.subsidiaryWorkplace.asObservable();
  }

  public get canShowBannerObservable(): Observable<boolean> {
    return this._canShowBanner$.asObservable();
  }

  public set canShowBanner(canShowBanner: boolean) {
    this._canShowBanner$.next(canShowBanner);
  }
}