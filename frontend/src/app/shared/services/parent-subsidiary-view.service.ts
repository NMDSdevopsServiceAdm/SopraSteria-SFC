import { Injectable } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParentSubsidiaryViewService {
  private subsidiaryUidSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private subsidiaryWorkplace: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  private _showSelectedTab$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public readonly showSelectedTab$: Observable<string> = this._showSelectedTab$.asObservable();

  private viewingSubAsParent = false;
  private subsidiaryUid: string

  constructor(
    private establishmentService: EstablishmentService,
  ) {}

  public get showSelectedTab(): string {
    return this._showSelectedTab$.value;
  }

  public set showSelectedTab(selectedTab: string) {
    this._showSelectedTab$.next(selectedTab);
  }

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

  // Method to get the current UID as an observable
  getObservableSubsidiary(): Observable<Establishment> {
    return this.subsidiaryWorkplace.asObservable();
  }
}
