import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-add-another-staff-record',
  templateUrl: './add-another-staff-record.component.html',
})
export class AddAnotherStaffRecordComponent implements OnInit {
  public form: UntypedFormGroup;
  private workplaceUid: string;

  constructor(
    protected backLinkService: BackLinkService,
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected establishmentService: EstablishmentService,
  ) {
    this.form = this.formBuilder.group({
      addAnotherStaffRecord: null,
    });
  }
  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;
  }

  public onSubmit() {
    if (this.form.controls['addAnotherStaffRecord'].value === 'YES') {
      this.router.navigate(['/workplace', this.workplaceUid, 'staff-record', 'create-staff-record', 'staff-details']);
    } else {
      this.router.navigate([
        '/workplace',
        this.workplaceUid,
        'staff-record',
        'update-workplace-details-after-adding-staff',
      ]);
    }
  }
}
