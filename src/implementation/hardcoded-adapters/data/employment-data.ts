import type { EmploymentPeriod } from '@domain-app/entities/employment';

export const employmentPeriodHardCodedData: Array<EmploymentPeriod> = [
  {
    id: '1',
    role: 'Software Engineer',
    responsibilities: 'Developing software',
    employer: {
      id: '1',
      name: 'Employer 1',
    },
    start: new Date('2019-01-01'),
    end: new Date('2020-01-01'),
  },
  {
    id: '2',
    role: 'Software Engineer',
    responsibilities: 'Developing software',
    employer: {
      id: '1',
      name: 'Employer 1',
    },
    start: new Date('2019-01-01'),
    end: new Date('2020-01-01'),
  },
  {
    id: '3',
    role: 'Software Engineer',
    responsibilities: 'Developing software',
    employer: {
      id: '1',
      name: 'Employer 1',
    },
    start: new Date('2019-01-01'),
    end: new Date('2020-01-01'),
  },
];
