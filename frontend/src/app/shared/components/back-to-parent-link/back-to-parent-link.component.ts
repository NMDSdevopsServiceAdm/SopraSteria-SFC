import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private router: Router, private parentSubsidiaryViewService: ParentSubsidiaryViewService) {}

  ngOnInit() {}

  public backToParentLinkClick(event: Event) {
    event.preventDefault();
    this.parentSubsidiaryViewService.clearViewingSubAsParent();
    this.router.navigate(['/dashboard']);
  }
}
