import type { ContactChannelType } from '@myself-app/domain';
import { ExternalLink } from '@myself-app/entifix-incubator-react-controls';

import { ChannelMark } from '../../atoms/icons/icons.js';

export interface ChannelLinkData {
  readonly id: string;
  readonly type: ContactChannelType;
  readonly url: string;
  /** The network's name: "Instagram". */
  readonly label: string;
  /** The handle, under the name: "herbercolop". */
  readonly handle: string;
  /** The link's accessible name, containing `label`: "Instagram: herbercolop". */
  readonly name: string;
}

/**
 * The personal channels on "Beyond the code": a heading, then a row of
 * buttons — the network's mark in a badge, its name and the handle — that
 * take the network's own colour on hover and focus (`site.css`, keyed by
 * `data-channel`).
 */
export function ChannelLinks({
  id,
  label,
  channels,
}: {
  /** The heading's id, unique on the page. */
  id: string;
  /** The heading: "Find me elsewhere". */
  label: string;
  channels: readonly ChannelLinkData[];
}) {
  return (
    <div className="channel-links">
      <p id={id} className="channel-links-heading">
        {label}
      </p>
      <ul className="channel-links-list" aria-labelledby={id}>
        {channels.map(channel => (
          <li key={channel.id}>
            <ExternalLink
              href={channel.url}
              className="channel-link"
              data-channel={channel.type}
              aria-label={channel.name}
            >
              <span className="channel-link-badge">
                <ChannelMark
                  type={channel.type}
                  className="channel-link-icon"
                />
              </span>
              <span className="channel-link-text">
                <span className="channel-link-name">{channel.label}</span>
                <span className="channel-link-handle">{channel.handle}</span>
              </span>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
