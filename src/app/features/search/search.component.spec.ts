import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { SearchComponent } from './search.component';

fdescribe('SearchComponent', () => {
  it('should render the search component', async () => {
    const { click, getByText, debug, fixture } = await render(SearchComponent, {
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule.withRoutes([{ path: 'search-groups', component: SearchComponent }]),
      ],
    });

    click(getByText('Groups'));
    fixture.detectChanges();

    debug();
  });
});
