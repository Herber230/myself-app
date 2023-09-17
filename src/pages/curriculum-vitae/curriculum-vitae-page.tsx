import type { ContactInfo } from '@domain-app/entities/contact';
import type { EmploymentPeriod } from '@domain-app/entities/employment';
import styled from '@emotion/styled';
import { contactHardcodedAdapter } from '@implementation/hardcoded-adapters/contact-adapter';
import { employmentPeriodHardcodedAdapter } from '@implementation/hardcoded-adapters/employment-period-adapter';
import { profileBasicInfoHardcodedAdapter } from '@implementation/hardcoded-adapters/profile-basic-info-adapter/profile-basic-info-hardcoded-adapter';
import { technologyUsePeriodHardcodedAdapter } from '@implementation/hardcoded-adapters/technology-use-period-adapter';
import { ContactInfoPanel } from '@presentation-app/organisms/contact-info-panel';
import { EmploymentHistoryPanel } from '@presentation-app/organisms/employment-history-panel';
import { ProfileBasicInfoPanel } from '@presentation-app/organisms/profile-basic-info-panel';
import { TechnologyPathSummary } from '@presentation-app/organisms/technology-path-summary';
import { NavigationWithBody } from '@presentation-app/templates';
import { getTechnologyUsePeriodsBySummaryTypeUC } from '@use-cases-app/get-technology-use-periods-by-summary-type';
import { getEntityCollection } from '@use-cases-generic/get-entity-collection';
import { getSingleEntity } from '@use-cases-generic/get-single-entity';
import { curry } from 'ramda';

//TODO: Compose with ramda.
// Hardcoded adapters do not require an id, so we pass an empty string
const getProfileInfo = () =>
  getSingleEntity(profileBasicInfoHardcodedAdapter, ''); // The adapter does not require an id
const getContactInfo = () =>
  getSingleEntity<ContactInfo>(contactHardcodedAdapter, '');
const getEmploymentHistory = () =>
  getEntityCollection<EmploymentPeriod>(employmentPeriodHardcodedAdapter);

const getTechnologySummary = curry(getTechnologyUsePeriodsBySummaryTypeUC)(
  technologyUsePeriodHardcodedAdapter,
);

const StyledSheet = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  margin: ${({ theme }) => theme.spacing(6, 'auto')};
  width: 21cm;
  height: 29.7cm;
  display: flex;
  flex-direction: row;
  padding: 25px;

  > div:nth-of-type(1) {
    width: 300px;
    margin-right: ${({ theme }) => theme.spacing(4)};
    > div:nth-of-type(1) {
      margin-bottom: ${({ theme }) => theme.spacing(4)};
    }
  }
  > div:nth-of-type(2) {
    > div:nth-of-type(1) {
      margin-bottom: ${({ theme }) => theme.spacing(4)};
    }
  }
`;

export function CurriculumVitaePage(): JSX.Element {
  return (
    <NavigationWithBody
      contentContainer={{
        padding: 0,
        background: 'tertiary',
      }}
    >
      <StyledSheet>
        <div>
          <ProfileBasicInfoPanel uc={getProfileInfo} />
          <ContactInfoPanel uc={getContactInfo} />
        </div>
        <div>
          <TechnologyPathSummary uc={getTechnologySummary} />
          <EmploymentHistoryPanel uc={getEmploymentHistory} />
        </div>
      </StyledSheet>
    </NavigationWithBody>
  );
}
