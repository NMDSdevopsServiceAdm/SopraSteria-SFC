import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockArticlesService } from '@core/test-utils/MockArticlesService';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { SharedModule } from '@shared/shared.module';
import { getByText, render } from '@testing-library/angular';

import { DeleteMandatoryTrainingCategoryComponent } from './delete-mandatory-training-category.component';

describe('DeleteMandatoryTrainingCategoryComponent', () => {
  const pages = MockPagesService.pagesFactory();
  const articleList = MockArticlesService.articleListFactory();

  async function setup() {
    const { fixture, getByText } = await render(DeleteMandatoryTrainingCategoryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
    };
  }

  fit('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
