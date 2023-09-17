import type { ContactInfo } from '@domain-app/entities/contact';

export const contactData: ContactInfo = {
  id: 'unique',
  email: {
    displayName: 'email',
    url: 'mailto:',
  },
  linkedin: {
    displayName: 'linkedin',
    url: 'https://www.linkedin.com/in/',
  },
  github: {
    displayName: 'github',
    url: '',
  },
  stackoverflow: {
    displayName: 'stackoverflow',
    url: 'https://stackoverflow.com/users/',
  },
  medium: {
    displayName: 'medium',
    url: 'https://medium.com/@',
  },
  goodreads: {
    displayName: 'goodreads',
    url: 'https://www.goodreads.com/user/show/',
  },
  twitter: {
    displayName: 'twitter',
    url: 'https://twitter.com/',
  },
  facebook: {
    displayName: 'facebook',
    url: 'https://www.facebook.com/',
  },
};
