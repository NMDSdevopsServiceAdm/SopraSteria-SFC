import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountDetails } from '@features/account/account-details/account-details';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
  declarations: [AccountDetails],
  exports: [AccountDetails],
})
export class AccountModule {}
