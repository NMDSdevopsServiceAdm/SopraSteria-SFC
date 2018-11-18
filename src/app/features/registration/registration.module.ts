import { NgModule } from '@angular/core';

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { LocationtData } from './location-data';

import { LocationService } from '../../core/services/location.service';



@NgModule({
  imports: [
    InMemoryWebApiModule.forRoot(LocationtData)
  ],
  declarations: [
    
  ],
  providers: [
    LocationService
  ]
})
export class ConfirmAccountDetailsModule { }
