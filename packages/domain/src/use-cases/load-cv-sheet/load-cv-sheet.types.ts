import type { Certificate } from '../../entities/certificate.entity.js';
import type { ContactChannel } from '../../entities/contact-channel.entity.js';
import type { CvVariant } from '../../entities/cv-variant.entity.js';
import type { Education } from '../../entities/education.entity.js';
import type { Employer } from '../../entities/employer.entity.js';
import type { EmploymentHighlight } from '../../entities/employment-highlight.entity.js';
import type { EmploymentPeriod } from '../../entities/employment-period.entity.js';
import type { Profile } from '../../entities/profile.entity.js';
import type { Technology } from '../../entities/technology.entity.js';

export interface CvEmployment {
  readonly period: EmploymentPeriod;
  readonly employer: Employer;
  /** The variant's ones used there, in the order the employment lists them. */
  readonly technologies: readonly Technology[];
  /** The ones sharing a focus with the variant, by their order. */
  readonly highlights: readonly EmploymentHighlight[];
}

export interface CvSheet {
  readonly profile: Profile;
  readonly channels: readonly ContactChannel[];
  readonly variant: CvVariant;
  /** In the order the variant lists them. */
  readonly technologies: readonly Technology[];
  /** In the order the variant lists them. */
  readonly employments: readonly CvEmployment[];
  readonly education: readonly Education[];
  readonly certificates: readonly Certificate[];
}
