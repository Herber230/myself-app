import type { ContactChannelType } from '@myself-app/domain';

import { CopyButton } from '../../atoms/copy-button/copy-button.js';
import { ChannelMark } from '../../atoms/icons/icons.js';
import { LinkCard } from '../link-card/link-card.js';

export interface ContactCardData {
  readonly type: ContactChannelType;
  readonly url: string;
  /** The channel's name: "GitHub". */
  readonly channel: string;
  /** The handle it shows: "Herber230". */
  readonly handle: string;
  /** The link's accessible name: "GitHub: Herber230". */
  readonly name: string;
  /** What following it does: "See my code". */
  readonly action: string;
  /** A value to offer for copying (the email address), with its labels. */
  readonly copy?: {
    readonly value: string;
    readonly label: string;
    readonly name: string;
    readonly copiedLabel: string;
  };
}

/**
 * A way to reach me on the landing page, as a `LinkCard`: the channel's
 * logo, its name above the handle, and what following it does — with, for
 * the email, a button that copies the address.
 */
export function ContactCard({
  type,
  url,
  channel,
  handle,
  name,
  action,
  copy,
}: ContactCardData) {
  return (
    <LinkCard
      href={url}
      title={handle}
      titleAs="p"
      name={name}
      eyebrow={channel}
      cue={action}
      mark={<ChannelMark type={type} className="link-card-logo" />}
      markKind="logo"
      variant={type}
      extra={
        copy && (
          <CopyButton
            value={copy.value}
            label={copy.label}
            name={copy.name}
            copiedLabel={copy.copiedLabel}
            className="contact-card-copy"
          />
        )
      }
    />
  );
}
