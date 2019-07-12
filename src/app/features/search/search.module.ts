import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './search.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, SearchRoutingModule, FormsModule],
  declarations: [
    SearchComponent
  ]
})
export class SearchModule { }
