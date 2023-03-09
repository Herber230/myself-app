import { PlainSectionsProps } from './plain-sections.types';

export function PlainSections({ children }: PlainSectionsProps): JSX.Element {
  return (
    <div>
      <br />
      <br />
      Plain Sections!!!
      <br />
      <br />
      {children}
    </div>
  );
}
