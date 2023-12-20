import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArticleResolver } from '@core/resolvers/article.resolver';
import { SharedModule } from '@shared/shared.module';

import { ArticleComponent } from './article/article.component';
import { ArticlesRoutingModule } from './articles-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, ArticlesRoutingModule],
  declarations: [ArticleComponent],
  providers: [ArticleResolver],
})
export class ArticlesModule {}
