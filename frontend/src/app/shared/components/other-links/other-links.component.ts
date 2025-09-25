import { Component, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-other-links',
  templateUrl: './other-links.component.html',
})
export class OtherLinksComponent implements OnInit {
  @Input() canBulkUpload: boolean;
  @Input() canViewReports: boolean;
  @Input() canLinkToParent: boolean;
  @Input() isParent: boolean;
  @Input() canBecomeAParent: boolean;
  @Input() linkToParentRequestedStatus: boolean;
  @Input() canRemoveParentAssociation: boolean;
  @Input() canViewDataPermissionsLink: boolean;
  @Input() canViewChangeDataOwner: boolean;
  @Input() isParentSubsidiaryView: boolean;
  @Input() parentStatusRequested: boolean;
  @Input() isOwnershipRequested: boolean;
  @Output() cancelChangeDataOwnerRequestEvent: EventEmitter<Event> = new EventEmitter();
  @Output() ownershipChangeMessageEvent: EventEmitter<Event> = new EventEmitter();

  ngOnInit(): void {}

  public cancelChangeDataOwnerRequest(event: Event): void {
    event.preventDefault();
    this.cancelChangeDataOwnerRequestEvent.emit(event);
  }

  public ownershipChangeMessage(event: Event): void {
    event.preventDefault();
    this.ownershipChangeMessageEvent.emit(event);
  }
}
