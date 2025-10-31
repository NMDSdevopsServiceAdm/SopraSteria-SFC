import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
    selector: 'app-other-links',
    templateUrl: './other-links.component.html',
    standalone: false
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

  ngOnInit(): void {}
}
