import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-edit-workplace',
  templateUrl: './edit-workplace.component.html',
})
export class EditWorkplaceComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService
  ) {}

  ngOnInit() {
    // this.establishmentService.setState(this.route.snapshot.data.establishment); // TODO
  }

  ngOnDestroy(): void {
    // if not in subs view
    if(!this.parentSubsidiaryViewService.getViewingSubAsParent()) {
      this.establishmentService.setReturnTo(null);
    }
  }
}
