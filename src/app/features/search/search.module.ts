import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '@core/services/dialog.service';
import {
  AdminUnlockConfirmationDialogComponent,
} from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';
import { SharedModule } from '@shared/shared.module';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';

@NgModule({
  imports: [CommonModule, OverlayModule, ReactiveFormsModule, SharedModule, SearchRoutingModule, FormsModule],
  providers: [DialogService],
  declarations: [
    SearchComponent,
    AdminUnlockConfirmationDialogComponent
  ],
  entryComponents: [AdminUnlockConfirmationDialogComponent]
})
export class SearchModule { }
