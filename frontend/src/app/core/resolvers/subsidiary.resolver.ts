import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Injectable({
  providedIn: 'root'
})
export class SubsidiaryResolver implements Resolve<any> {

  constructor(
    private establishmentService: EstablishmentService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    // const subsidiaryUid = route.paramMap.get('subsidiaryUid');

    const subsidiaryUid = this.parentSubsidiaryViewService.getSubsidiaryUid();
    console.log("SubsidaryUid resolver: ", subsidiaryUid);
    return new Observable(observer => {
      this.establishmentService.getEstablishment(subsidiaryUid)
        .subscribe(workplace => {
          observer.next(workplace);
          observer.complete();
          console.log("Workplace: ", workplace);
        });
    });
  }
}

