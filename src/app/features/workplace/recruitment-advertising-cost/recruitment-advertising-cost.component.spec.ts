import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RecruitmentAdvertisingCostComponent } from './recruitment-advertising-cost.component';

describe('RecruitmentAdvertisingCostComponent', () => {
  async function setup() {
    const { fixture } = await render(RecruitmentAdvertisingCostComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [FormBuilder],
    });

    const component = fixture.componentInstance;

    return { component };
  }

  it('should render a RecruitmentAdvertisingCostComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
