import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() parentWorkplaceName: string;
  @Input() parentUid: string;
  @Output() backToParentLinkClicked = new EventEmitter();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private establishmentService: EstablishmentService,
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
  ) {}

  ngOnInit() {}

  private setWorkplace(): void {
    this.subscriptions.add(
      this.establishmentService.getEstablishment(this.parentUid, true).subscribe((workplace) => {
        this.establishmentService.setState(workplace);
      }),
    );
  }

  public backToParentLinkClick(event: Event) {
    event.preventDefault();
    //this.setWorkplace();
    this.parentSubsidiaryViewService.clearViewingSubAsParent();
    this.router.navigate(['/dashboard']);
  }
}
