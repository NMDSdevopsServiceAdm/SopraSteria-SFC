import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { ArticleResolver } from '@core/resolvers/article.resolver';
import { SharedModule } from '@shared/shared.module';

import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleComponent } from './article/article.component';
import { ArticlesRoutingModule } from './articles-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, SharedModule, OverlayModule, ArticlesRoutingModule],
  declarations: [ArticleComponent, ArticleListComponent],
  providers: [ArticleResolver, ArticleListResolver],
})
export class ArticlesModule {}
