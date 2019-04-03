import { Component, OnDestroy, OnInit } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workplace-tab',
  templateUrl: './workplace-tab.component.html',
})
export class WorkplaceTabComponent implements OnInit, OnDestroy {
  public workplace: any;
  public updateWorkplace: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit() {
    const workplaceId = parseInt(localStorage.getItem('establishmentId'), 10);
    this.subscriptions.add(
      this.establishmentService
        .getEstablishment(workplaceId)
        .pipe(take(1))
        .subscribe(workplace => {
          this.workplace = workplace;
        })
    );

    this.subscriptions.add(
      this.establishmentService
        .getEmployerType()
        .pipe(take(1))
        .subscribe(d => {
          this.updateWorkplace = !d.employerType;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
