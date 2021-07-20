import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { ArticleResolver } from '@core/resolvers/article.resolver';

import { ArticleComponent } from './article/article.component';

const routes: Routes = [
  {
    path: ':slug',
    component: ArticleComponent,
    resolve: {
      articles: ArticleResolver,
      articleList: ArticleListResolver,
    },
    data: { title: 'Article' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArticlesRoutingModule {}
