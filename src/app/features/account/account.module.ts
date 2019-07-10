import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountDetailsComponent } from '@features/account/account-details/account-details.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
  declarations: [AccountDetailsComponent],
  exports: [AccountDetailsComponent],
})
export class AccountModule {}
