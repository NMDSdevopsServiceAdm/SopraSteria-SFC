import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';
import { PageResolver } from '@core/resolvers/page.resolver';

import { AboutUsComponent } from './about-us/about-us.component';

const routes: Routes = [
  {
    path: 'about-ascwds',
    component: AboutUsComponent,
    resolve: {
      articleList: ArticleListResolver,
      pages: PageResolver,
    },
    data: { title: 'About the ASC-WDS' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
