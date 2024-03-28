import { Injectable } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParentSubsidiaryViewService {
  private subsidiaryUidSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private subsidiaryWorkplace: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  private _showSelectedTab$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public readonly showSelectedTab$: Observable<string> = this._showSelectedTab$.asObservable();
  private _canShowBanner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private _getLastUpdatedDate$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private _totalRecords$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public readonly totalTrainingRecords$: Observable<any> = this._totalRecords$.asObservable();
  private totalRecords: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private viewingSubAsParent = false;
  private subsidiaryUid: string;
  private hasWorkers = false;

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

    this.establishmentService.getEstablishment(subsidiaryUid).subscribe((workplace) => {
      if (workplace) {
        this.establishmentService.setPrimaryWorkplace(workplace);
        this.establishmentService.setWorkplace(workplace);
        this.subsidiaryWorkplace.next(workplace);
      }
    });
  }

  setHasWorkers(workersCount: number) {
    return (this.hasWorkers = workersCount > 0);
  }

  getTotalTrainingRecords(): BehaviorSubject<number> {
    return this.totalRecords;
  }

  setTotalTrainingRecords(totalRecords: number) {
    this._totalRecords$.next(totalRecords);
  }

  clearViewingSubAsParent() {
    this.subsidiaryUid = null;
    this.viewingSubAsParent = false;
    this.subsidiaryUidSubject.next('');
    this.subsidiaryWorkplace.next(null);
  }

  getHasWorkers() {
    return this.hasWorkers;
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

  public get getLastUpdatedDateObservable(): Observable<string> {
    return this._getLastUpdatedDate$.asObservable();
  }

  public set getLastUpdatedDate(lastUpdatedDate: string) {
    this._getLastUpdatedDate$.next(lastUpdatedDate);
  }
}
