import type { ContactInfo } from '@domain-app/entities/contact';

import { contactData } from '../data/contact-data';

export function contactHardcodedAdapter(): Promise<ContactInfo> {
  return Promise.resolve(contactData);
}
