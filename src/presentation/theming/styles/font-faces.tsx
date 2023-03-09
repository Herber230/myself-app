import { Global } from '@emotion/react';

export function FontFaces(): JSX.Element {
  return (
    <Global
      styles={[
        {
          '@font-face': {
            fontFamily: 'Share Tech Mono',
            src: 'url(fonts/ShareTechMono-Regular.ttf) format("truetype")',
          },
        },
        {
          '@font-face': {
            fontFamily: 'Ubuntu',
            fontWeight: '300',
            src: 'url(fonts/Ubuntu-Light.ttf) format("truetype")',
          },
        },
        {
          '@font-face': {
            fontFamily: 'Ubuntu',
            fontWeight: '400',
            src: 'url(fonts/Ubuntu-Regular.ttf) format("truetype")',
          },
        },
        {
          '@font-face': {
            fontFamily: 'Ubuntu',
            fontWeight: '700',
            src: 'url(fonts/Ubuntu-Bold.ttf) format("truetype")',
          },
        },
      ]}
    />
  );
}
