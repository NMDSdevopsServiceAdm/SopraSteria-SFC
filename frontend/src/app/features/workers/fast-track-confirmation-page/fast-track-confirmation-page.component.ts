import { Component, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';

import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-fast-track-confirmation-page',
  templateUrl: './fast-track-confirmation-page.component.html',
  standalone: false,
})
export class FastTrackConfirmationPageComponent implements OnInit {
  public form: UntypedFormGroup;

  constructor(private backLinkService: BackLinkService, private formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.setBackLink();

    this.setupForm();
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workers: this.formBuilder.array([]),
    });
  }
}
