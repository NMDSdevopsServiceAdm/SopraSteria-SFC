import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ParentRequestsListComponent } from './parent-requests-list.component';

describe('ParentRequestsListComponent', () => {
  async function setup() {
    const component = await render(ParentRequestsListComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
            },
          },
        },
      ],
    });

    const fixture = component.fixture;

    return {
      fixture,
      component,
    };
  }

  it('should render a ParentRequestsListComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the title "Parent requests"', async () => {
    const { component } = await setup();

    expect(component.getByText('Parent requests')).toBeTruthy();
  });
});
