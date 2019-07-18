import { Component, OnDestroy } from '@angular/core';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-edit-workplace',
  templateUrl: './edit-workplace.component.html',
})
export class EditWorkplaceComponent implements OnDestroy {
  constructor(private establishmentService: EstablishmentService) {}

  ngOnDestroy(): void {
    this.establishmentService.setReturnTo(null);
  }
}
