import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleListResolver } from '@core/resolvers/article-list.resolver';

import { AboutUsComponent } from './about-us/about-us.component';

const routes: Routes = [
  {
    path: 'about-us',
    component: AboutUsComponent,
    resolve: {
      articleList: ArticleListResolver,
    },
    data: { title: 'About the ASC-WDS' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
