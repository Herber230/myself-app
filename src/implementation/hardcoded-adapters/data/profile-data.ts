import type { ProfileBasicInfo } from '@domain-app/entities/profile-basic-info';

export const profileBasicInfoHardcodedData: ProfileBasicInfo = {
  id: '1',
  firstName: 'Herber',
  lastName: 'Colop',
  email: 'herbercolop@gmail.com',
  title: 'Software Engineer',
  bio: 'Software passionate and persistent problem solver. Focused on resource development to improve team productivity. Mainly experienced as a Typescript developer for NodeJS, ReactJS andAngular applications. Advocate for reactive technologies and microservices pattern.',
  picture: {
    url: 'https://avatars.githubusercontent.com/u/1140245?v=4',
    alt: 'Herber Colop profile picture',
  },
};
