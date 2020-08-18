import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BenchmarksAboutTheDataComponent } from './about-the-data/about-the-data.component';
import { SharedModule } from '@shared/shared.module';
import { BenchmarksRoutingModule } from '@shared/components/benchmarks-tab/benchmarks-routing.module';


@NgModule({
  imports: [CommonModule, RouterModule, OverlayModule,SharedModule,BenchmarksRoutingModule],
  declarations: [
    BenchmarksAboutTheDataComponent,
  ],
  exports: [
    BenchmarksAboutTheDataComponent,
  ],
  providers: [
  ],
})
export class BenchmarksModule {}
