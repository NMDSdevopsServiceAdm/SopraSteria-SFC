import { Injectable } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParentSubsidiaryViewService {
  private subsidiaryWorkplace: BehaviorSubject<Establishment> = new BehaviorSubject<Establishment>(null);
  private viewingSubAsParent = false;
  private subsidiaryUid: string;

  constructor(private establishmentService: EstablishmentService) {}

  setViewingSubAsParent(subsidiaryUid: string) {
    this.subsidiaryUid = subsidiaryUid;
    this.viewingSubAsParent = true;

    this.establishmentService.getEstablishment(subsidiaryUid).subscribe((workplace) => {
      if (workplace) {
        this.establishmentService.setPrimaryWorkplace(workplace);
        this.establishmentService.setWorkplace(workplace);
        this.subsidiaryWorkplace.next(workplace);
      }
    });
  }

  clearViewingSubAsParent() {
    this.subsidiaryUid = null;
    this.viewingSubAsParent = false;
    this.subsidiaryWorkplace.next(null);
  }

  getViewingSubAsParentDashboard(navUrl): boolean {
    const subsidiaryDashboardUrls = [
      `/subsidiary/home/${this.subsidiaryUid}`,
      `/subsidiary/workplace/${this.subsidiaryUid}`,
      `/subsidiary/staff-records/${this.subsidiaryUid}`,
      `/subsidiary/training-and-qualifications/${this.subsidiaryUid}`,
      `/subsidiary/benchmarks/${this.subsidiaryUid}`,
      `/subsidiary/workplace-users/${this.subsidiaryUid}`,
    ];
    return subsidiaryDashboardUrls.includes(navUrl);
  }

  getViewingSubAsParent() {
    return this.viewingSubAsParent;
  }

  getSubsidiaryUid() {
    return this.subsidiaryUid;
  }

  // Method to get the current subsidiary as an observable
  getObservableSubsidiary(): Observable<Establishment> {
    return this.subsidiaryWorkplace.asObservable();
  }
}
