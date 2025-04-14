import { render } from '@testing-library/angular';
import { JobRoleNumbersTableComponent } from './job-role-numbers-table.component';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Vacancy } from '@core/model/establishment.model';

fdescribe('JobRolesNumberTableComponent', () => {
  const mockSelectedJobRoles: Vacancy[] = [
    {
      jobId: 10,
      title: 'Care worker',
      total: 1,
    },
    {
      jobId: 23,
      title: 'Registered nurse',
      total: 2,
    },
  ];

  const setup = async (override: any = {}) => {
    const selectedJobRoles: Vacancy[] = override.selectedJobRoles ?? mockSelectedJobRoles;
    const formBuilder = new UntypedFormBuilder();
    const jobRoleNumbers = formBuilder.array(
      selectedJobRoles.map((job) => job.total),
      { updateOn: 'submit', validators: [] },
    );

    const setupTools = await render(JobRoleNumbersTableComponent, {
      imports: [SharedModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [],
      componentProperties: {
        jobRoleNumbers,
        selectedJobRoles,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component };
  };

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });
});
