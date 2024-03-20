import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { GetChildWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() parentWorkplaceName: string;

  public primaryWorkplace: Establishment;
  public childWorkplaces: Workplace[];

  constructor(
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit() {
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.getChildWorkplaces();
  }

  private getChildWorkplaces(): void {
    this.establishmentService
      .getChildWorkplaces(this.primaryWorkplace.uid)
      .pipe()
      .subscribe((data: GetChildWorkplacesResponse) => {
        this.childWorkplaces = data.childWorkplaces;
      });
  }

  onChange(event) {
    if (event === this.primaryWorkplace.name) {
      this.parentSubsidiaryViewService.clearViewingSubAsParent();
      this.router.navigate(['/dashboard']);
    }
  }
}
