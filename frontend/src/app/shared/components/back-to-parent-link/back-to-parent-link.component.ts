import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { Router } from '@angular/router';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() parentWorkplaceName: string;
  @Output() backToParentLinkClicked = new EventEmitter();

  constructor(
    private establishmentService: EstablishmentService,
    private route: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit() {}

  public backToParentLinkClick(event: Event) {
    event.preventDefault();

    this.backToParentLinkClicked.emit(event);
    this.parentSubsidiaryViewService.clearViewingSubAsParent();
    this.route.navigate(['dashboard']);
  }
}
