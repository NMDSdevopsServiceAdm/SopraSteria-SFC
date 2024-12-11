import { JobService } from './job.service';

describe('JobService', () => {
  describe('sortJobsByJobGroup', () => {
    const mockJobs = [
      {
        id: 1,
        title: 'Activities worker, co-ordinator',
        jobRoleGroup: 'Other roles',
      },
      {
        id: 2,
        title: 'Administrative',
        jobRoleGroup: 'Other roles',
      },
      {
        id: 4,
        title: 'Allied health professional (not occupational therapist)',
        jobRoleGroup: 'Professional and related roles',
      },
      {
        id: 10,
        title: 'Care worker',
        jobRoleGroup: 'Care providing roles',
      },
      {
        id: 11,
        title: 'Community support and outreach work',
        jobRoleGroup: 'Care providing roles',
      },
      {
        id: 33,
        title: 'Data analyst',
        jobRoleGroup: 'IT, digital and data roles',
      },
      {
        id: 34,
        title: 'Data governance manager',
        jobRoleGroup: 'IT, digital and data roles',
      },
      {
        id: 30,
        title: 'Deputy manager',
        jobRoleGroup: 'Managerial and supervisory roles',
      },
      {
        id: 13,
        title: 'First-line manager',
        jobRoleGroup: 'Managerial and supervisory roles',
      },
      {
        id: 16,
        title: 'Nursing assistant',
        jobRoleGroup: 'Professional and related roles',
      },
    ];

    it('should sort the given jobs into groups, with description text for each group', () => {
      const actual = JobService.sortJobsByJobGroup(mockJobs);
      const expectedOutput = [
        {
          title: 'Care providing roles',
          descriptionText: 'Jobs like care worker, community support, support worker',
          items: [
            {
              label: 'Care worker',
              id: 10,
            },
            {
              label: 'Community support and outreach work',
              id: 11,
            },
          ],
        },
        {
          title: 'Professional and related roles',
          descriptionText: 'Jobs like occupational therapist, registered nurse, nursing assistant',
          items: [
            {
              label: 'Allied health professional (not occupational therapist)',
              id: 4,
            },
            {
              label: 'Nursing assistant',
              id: 16,
            },
          ],
        },
        {
          title: 'Managerial and supervisory roles',
          descriptionText: 'Jobs like registered manager, supervisor, team leader',
          items: [
            {
              label: 'Deputy manager',
              id: 30,
            },
            {
              label: 'First-line manager',
              id: 13,
            },
          ],
        },
        {
          title: 'IT, digital and data roles',
          descriptionText: 'Jobs like data analyst, IT and digital support, IT manager',
          items: [
            {
              label: 'Data analyst',
              id: 33,
            },
            {
              label: 'Data governance manager',
              id: 34,
            },
          ],
        },
        {
          title: 'Other roles',
          descriptionText: 'Jobs like admin, care co-ordinator, learning and development',
          items: [
            {
              label: 'Activities worker, co-ordinator',
              id: 1,
            },
            {
              label: 'Administrative',
              id: 2,
            },
          ],
        },
      ];

      expect(actual).toEqual(expectedOutput);
    });
  });
});
