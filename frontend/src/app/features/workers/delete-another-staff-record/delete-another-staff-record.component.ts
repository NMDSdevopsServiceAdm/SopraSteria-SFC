import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'delete-add-another-staff-record',
  templateUrl: './delete-another-staff-record.component.html',
})
export class DeleteAnotherStaffRecordComponent implements OnInit{
  public form: UntypedFormGroup;
  private workplaceUid: string;

  constructor(
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected establishmentService: EstablishmentService,
  ) {
    this.form = this.formBuilder.group({
      deleteAnotherStaffRecord: null,
    });
  }
  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;
  }

  public onSubmit() {
    if (this.form.controls['deleteAnotherStaffRecord'].value === 'YES') {
      this.router.navigate(['/dashboard'], {fragment: 'staff-records'});
    } else {
      this.router.navigate(['/workplace', this.workplaceUid, 'staff-record', 'update-workplace-details-after-staff-changes']);
    }
  }


}