import { Component, input } from '@angular/core';
import { CareWorkforcePathwayRoleCategory } from '@core/model/careWorkforcePathwayCategory.model';

@Component({
  selector: 'app-display-cwp-role-category',
  templateUrl: './display-cwp-role-category.component.html',
  standalone: false,
})
export class DisplayCwpRoleCategoryComponent {
  careWorkforcePathwayRoleCategory = input<CareWorkforcePathwayRoleCategory>();
}
