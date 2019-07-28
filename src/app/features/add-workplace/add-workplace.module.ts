import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddWorkplaceRoutingModule } from '@features/add-workplace/add-workplace-routing.module';
import { RegulatedByCqcComponent } from '@features/add-workplace/regulated-by-cqc/regulated-by-cqc.component';
import { StartComponent } from '@features/add-workplace/start/start.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, AddWorkplaceRoutingModule],
  declarations: [StartComponent, RegulatedByCqcComponent],
})
export class AddWorkplaceModule {}
