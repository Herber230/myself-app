import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const ISSUER = 'token.actions.githubusercontent.com';

/** Created by `bootstrap/state.cfn.yaml`, outside this stack. */
export const STATE_BUCKET = 'myself-app-pulumi-state-206772512116';
const STATE_KEY_ALIAS = 'alias/myself-app-pulumi';

/** Every role this stack creates is named with it; the deploy role's IAM
 *  permissions stop at the prefix. */
export const ROLE_PREFIX = 'myself-app-';

export interface GitHubRolesArgs {
  /** `owner/name`. */
  repository: string;
  /** The GitHub environment the deploy role trusts; only `main` deploys to it. */
  environment: string;
  siteBucketArn: pulumi.Input<string>;
  zoneId: pulumi.Input<string>;
}

const stateAccess = (actions: string[]) => [
  {
    Sid: 'PulumiState',
    Effect: 'Allow',
    Action: [
      's3:ListBucket',
      's3:GetObject',
      's3:PutObject',
      's3:DeleteObject',
    ],
    Resource: [
      `arn:aws:s3:::${STATE_BUCKET}`,
      `arn:aws:s3:::${STATE_BUCKET}/*`,
    ],
  },
  {
    Sid: 'PulumiSecrets',
    Effect: 'Allow',
    Action: actions,
    Resource: '*',
    Condition: {
      'ForAnyValue:StringEquals': { 'kms:ResourceAliases': STATE_KEY_ALIAS },
    },
  },
];

/**
 * The roles GitHub Actions assume through OIDC (ADR 0013): no AWS key is
 * stored anywhere.
 *
 * - `preview`, for pull requests: reads the account, writes only Pulumi's lock
 *   objects in the state bucket, and reads no other bucket's objects.
 * - `deploy`, for the `production` environment: applies the stack and syncs
 *   the site. It can change what the stack owns, including roles under
 *   `ROLE_PREFIX` — its own among them. The environment's branch rule is what
 *   keeps that to `main`.
 */
export class GitHubRoles extends pulumi.ComponentResource {
  readonly preview: aws.iam.Role;
  readonly deploy: aws.iam.Role;

  constructor(
    name: string,
    args: GitHubRolesArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super('myself-app:ci:GitHubRoles', name, {}, opts);
    const parent = { parent: this };

    const provider = new aws.iam.OpenIdConnectProvider(
      `${name}-oidc`,
      { url: `https://${ISSUER}`, clientIdLists: ['sts.amazonaws.com'] },
      parent,
    );
    const trust = (subject: string) =>
      pulumi.jsonStringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Federated: provider.arn },
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                [`${ISSUER}:aud`]: 'sts.amazonaws.com',
                [`${ISSUER}:sub`]: subject,
              },
            },
          },
        ],
      });

    this.preview = new aws.iam.Role(
      `${name}-preview`,
      {
        name: `${ROLE_PREFIX}preview`,
        description: 'pulumi preview on pull requests',
        assumeRolePolicy: trust(`repo:${args.repository}:pull_request`),
      },
      parent,
    );
    new aws.iam.RolePolicyAttachment(
      `${name}-preview-read-only`,
      {
        role: this.preview.name,
        policyArn: 'arn:aws:iam::aws:policy/ReadOnlyAccess',
      },
      parent,
    );
    new aws.iam.RolePolicy(
      `${name}-preview-policy`,
      {
        role: this.preview.id,
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            ...stateAccess(['kms:Decrypt']),
            {
              // `ReadOnlyAccess` reads every object in every bucket; a
              // preview needs the state and nothing else.
              Sid: 'NoOtherObjects',
              Effect: 'Deny',
              Action: 's3:GetObject',
              NotResource: `arn:aws:s3:::${STATE_BUCKET}/*`,
            },
          ],
        }),
      },
      parent,
    );

    this.deploy = new aws.iam.Role(
      `${name}-deploy`,
      {
        name: `${ROLE_PREFIX}deploy`,
        description:
          'pulumi up and the site sync, from the production environment',
        assumeRolePolicy: trust(
          `repo:${args.repository}:environment:${args.environment}`,
        ),
      },
      parent,
    );
    const account = aws.getCallerIdentityOutput({}, parent).accountId;
    new aws.iam.RolePolicy(
      `${name}-deploy-policy`,
      {
        role: this.deploy.id,
        policy: pulumi.jsonStringify({
          Version: '2012-10-17',
          Statement: [
            ...stateAccess([
              'kms:Decrypt',
              'kms:Encrypt',
              'kms:GenerateDataKey',
            ]),
            {
              Sid: 'SiteBucket',
              Effect: 'Allow',
              Action: 's3:*',
              Resource: [
                args.siteBucketArn,
                pulumi.interpolate`${args.siteBucketArn}/*`,
              ],
            },
            {
              // New buckets are auto-named, so creating one cannot be scoped
              // to a name known in advance.
              Sid: 'CreateBuckets',
              Effect: 'Allow',
              Action: ['s3:CreateBucket', 's3:ListAllMyBuckets'],
              Resource: '*',
            },
            {
              Sid: 'EdgeAndCertificates',
              Effect: 'Allow',
              Action: ['cloudfront:*', 'acm:*'],
              Resource: '*',
            },
            {
              Sid: 'SiteZone',
              Effect: 'Allow',
              Action: 'route53:*',
              Resource: pulumi.interpolate`arn:aws:route53:::hostedzone/${args.zoneId}`,
            },
            {
              Sid: 'ZoneLookupAndChanges',
              Effect: 'Allow',
              Action: [
                'route53:ListHostedZones',
                'route53:ListHostedZonesByName',
                'route53:GetChange',
              ],
              Resource: '*',
            },
            {
              Sid: 'OwnRolesAndProvider',
              Effect: 'Allow',
              Action: 'iam:*',
              Resource: [
                pulumi.interpolate`arn:aws:iam::${account}:role/${ROLE_PREFIX}*`,
                pulumi.interpolate`arn:aws:iam::${account}:oidc-provider/${ISSUER}`,
              ],
            },
          ],
        }),
      },
      parent,
    );

    this.registerOutputs({
      previewRoleArn: this.preview.arn,
      deployRoleArn: this.deploy.arn,
    });
  }
}
