import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { HttpModule } from '@angular/http';

import { ContinueCreatingAccountComponent } from './continue-creating-account.component';

import { ContinueCreatingAccountRoutingModule } from './continue-creating-account-routing.module';

@NgModule({
  imports: [
    ContinueCreatingAccountRoutingModule
  ],
  declarations: [
    ContinueCreatingAccountComponent
  ],
  providers: []
})
export class ContinueCreatingAccountModule { }
