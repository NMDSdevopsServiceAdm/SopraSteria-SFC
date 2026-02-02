import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-workplace-not-found',
  templateUrl: './workplace-not-found.component.html',
  standalone: false,
})
export class WorkplaceNotFoundComponent {
  public workplace: Establishment;
  constructor(
    protected router: Router,
    protected backService: BackService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.establishment;
    this.setBackLink();
  }

  private setBackLink(): void {
    const backLinkUrl = this.router.createUrlTree(['..', 'regulated-by-cqc'], { relativeTo: this.route }).toString();
    this.backService.setBackLink({ url: [backLinkUrl] });
  }

  public returnToWorkPlace(event: Event) {
    event.preventDefault();
    this.router.navigate(['/dashboard'], { fragment: 'workplace' });
  }
}
