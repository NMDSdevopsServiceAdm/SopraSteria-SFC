import { Injectable } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';

@Injectable({
  providedIn: 'root',
})
export class ParentSubsidiaryViewService {
  private viewingSubAsParent = false;
  private subsidiaryUid: string;

  constructor(private establishmentService: EstablishmentService) {}

  setViewingSubAsParent(subsidiaryUid: string): void {
    this.subsidiaryUid = subsidiaryUid;
    this.viewingSubAsParent = true;

    this.establishmentService.getEstablishment(subsidiaryUid).subscribe((workplace) => {
      if (workplace) {
        this.establishmentService.setPrimaryWorkplace(workplace);
        this.establishmentService.setWorkplace(workplace);
      }
    });
  }

  clearViewingSubAsParent(): void {
    this.subsidiaryUid = null;
    this.viewingSubAsParent = false;
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
}
