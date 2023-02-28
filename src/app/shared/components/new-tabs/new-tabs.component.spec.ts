import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { NewTabsComponent } from './new-tabs.component';

describe('NewTabsComponent', () => {
  const setup = async () => {
    const { fixture } = await render(NewTabsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [],
      declarations: [],
      componentProperties: {
        tabs: [
          { title: 'Home', slug: 'home', active: false },
          { title: 'Workplace', slug: 'workplace', active: false },
          { title: 'Staff records', slug: 'staff-records', active: false },
          { title: 'Training and qualifications', slug: 'training-and-qualifications', active: false },
          { title: 'Benchmarks', slug: 'benchmarks', active: false },
        ],
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
