import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  providers: [],
})
export class ArticleListComponent {
  constructor(private route: ActivatedRoute) {}

  //public articlelist: Article = this.route.snapshot.data.articles.data;
}
