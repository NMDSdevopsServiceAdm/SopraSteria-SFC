import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-edit-workplace',
  templateUrl: './edit-workplace.component.html',
})
export class EditWorkplaceComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.establishmentService.setState(this.route.snapshot.data.establishment);
  }

  ngOnDestroy(): void {
    this.establishmentService.setReturnTo(null);
  }
}
