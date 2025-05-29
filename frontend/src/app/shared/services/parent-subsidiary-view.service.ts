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
        this.establishmentService.setWorkplace(workplace);
      }
    });
  }

  clearViewingSubAsParent(): void {
    this.subsidiaryUid = null;
    this.viewingSubAsParent = false;
    this.establishmentService.setWorkplace(this.establishmentService.primaryWorkplace);
  }

  getViewingSubAsParentDashboard(navUrl: string): boolean {
    const subsidiaryDashboardUrls = [
      `/subsidiary/${this.subsidiaryUid}/home`,
      `/subsidiary/${this.subsidiaryUid}/workplace`,
      `/subsidiary/${this.subsidiaryUid}/staff-records`,
      `/subsidiary/${this.subsidiaryUid}/training-and-qualifications`,
      `/subsidiary/${this.subsidiaryUid}/benchmarks`,
      `/subsidiary/${this.subsidiaryUid}/workplace-users`,
    ];
    return subsidiaryDashboardUrls.some((url) => {
      return navUrl === url || navUrl.startsWith(`${url}?`);
    });
  }

  getViewingSubAsParent() {
    return this.viewingSubAsParent;
  }

  getSubsidiaryUid() {
    return this.subsidiaryUid;
  }
}
