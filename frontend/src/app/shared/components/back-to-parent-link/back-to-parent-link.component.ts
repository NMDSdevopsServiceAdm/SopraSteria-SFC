import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() parentWorkplace: Establishment;

  constructor(
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit() {}

  public backToParentLinkClick(event: Event) {
    event.preventDefault();
    this.parentSubsidiaryViewService.clearViewingSubAsParent();
    this.establishmentService.setWorkplace(this.parentWorkplace);
    this.establishmentService.setPrimaryWorkplace(this.parentWorkplace);
    this.router.navigate(['/dashboard']);
  }
}
