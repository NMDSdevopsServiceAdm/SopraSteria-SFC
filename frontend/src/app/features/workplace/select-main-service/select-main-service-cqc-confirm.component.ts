import { Component } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
    selector: 'app-select-main-service-cqc-confirm',
    templateUrl: './select-main-service-cqc-confirm.component.html',
    standalone: false
})
export class SelectMainServiceCqcConfirmComponent {
  constructor(
    public establishmentService: EstablishmentService
  ) {}
}

