import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Component({
  selector: 'app-new-qualifications',
  templateUrl: './new-qualifications.component.html',
})
export class NewQualificationsComponent implements OnInit {
  @Input() public workplace: Establishment;
  @Input() qualificationsByGroup: QualificationsByGroup;
  public canEditWorker: boolean;

  constructor(private permissionsService: PermissionsService) {}

  ngOnInit(): void {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
  }
}
