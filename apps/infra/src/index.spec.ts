import * as pulumi from '@pulumi/pulumi';
import { beforeAll, describe, expect, it } from 'vitest';

interface Registered {
  type: string;
  name: string;
  inputs: Record<string, unknown>;
}

const registered: Registered[] = [];

const ACCOUNT = '123456789012';
const ZONE = 'ZMOCK';

/** Computed attributes the program reads from what it creates. */
const computed = (type: string, name: string): Record<string, unknown> => {
  switch (type) {
    case 'aws:s3/bucket:Bucket':
      return {
        bucket: `${name}-generated`,
        arn: `arn:aws:s3:::${name}-generated`,
        bucketRegionalDomainName: `${name}-generated.s3.us-east-1.amazonaws.com`,
      };
    case 'aws:acm/certificate:Certificate':
      return {
        arn: 'arn:aws:acm:us-east-1:123456789012:certificate/mock',
        domainValidationOptions: ['herbercolop.dev', 'www.herbercolop.dev'].map(
          domainName => ({
            domainName,
            resourceRecordName: `_token.${domainName}.`,
            resourceRecordType: 'CNAME',
            resourceRecordValue: '_value.acm-validations.aws.',
          }),
        ),
      };
    case 'aws:cloudfront/distribution:Distribution':
      return {
        arn: `arn:aws:cloudfront::${ACCOUNT}:distribution/EMOCK`,
        domainName: 'dmock.cloudfront.net',
        hostedZoneId: 'Z2FDTNDATAQYW2',
      };
    default:
      return { arn: `arn:aws:mock::${ACCOUNT}:${name}` };
  }
};

const find = (type: string, name?: string): Registered => {
  const match = registered.find(
    resource => resource.type === type && (!name || resource.name === name),
  );
  if (!match) throw new Error(`no ${type} ${name ?? ''} was registered`);
  return match;
};

const resolve = <T>(output: pulumi.Output<T>): Promise<T> =>
  new Promise(done => output.apply(done));

type Stack = typeof import('./index.ts');
let stack: Stack;

beforeAll(async () => {
  pulumi.runtime.setAllConfig({
    'myself-app:domain': 'herbercolop.dev',
    'myself-app:githubRepository': 'Herber230/myself-app',
  });
  await pulumi.runtime.setMocks(
    {
      newResource: ({ type, name, inputs }) => {
        registered.push({ type, name, inputs });
        return {
          id: `${name}-id`,
          state: { ...inputs, ...computed(type, name) },
        };
      },
      call: ({ token, inputs }) => {
        if (token === 'aws:route53/getZone:getZone') {
          return { ...inputs, zoneId: ZONE };
        }
        if (token === 'aws:index/getCallerIdentity:getCallerIdentity') {
          return { accountId: ACCOUNT };
        }
        throw new Error(`unmocked call ${token}`);
      },
    },
    'myself-app',
    'prod',
  );
  // The program registers its resources as it is imported, so the mocks go
  // in first.
  stack = await import('./index.ts');
  // Resources waiting on another's outputs register later; draining the RPC
  // queue is what makes every registration visible to the assertions.
  await pulumi.runtime.disconnect();
});

describe('the site', () => {
  it('keeps the bucket private', () => {
    expect(
      find('aws:s3/bucketPublicAccessBlock:BucketPublicAccessBlock').inputs,
    ).toMatchObject({
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    });
    expect(
      find('aws:s3/bucketOwnershipControls:BucketOwnershipControls').inputs,
    ).toMatchObject({ rule: { objectOwnership: 'BucketOwnerEnforced' } });
  });

  it('lets only this distribution read the bucket, and list it for 404s', () => {
    const policy = JSON.parse(
      find('aws:s3/bucketPolicy:BucketPolicy').inputs['policy'] as string,
    );
    expect(policy.Statement).toEqual([
      expect.objectContaining({
        Principal: { Service: 'cloudfront.amazonaws.com' },
        Action: ['s3:GetObject', 's3:ListBucket'],
        Resource: [
          'arn:aws:s3:::site-bucket-generated',
          'arn:aws:s3:::site-bucket-generated/*',
        ],
        Condition: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${ACCOUNT}:distribution/EMOCK`,
          },
        },
      }),
    ]);
  });

  it('serves the apex and www over HTTPS only, with the 404 page', () => {
    const inputs = find('aws:cloudfront/distribution:Distribution').inputs;
    expect(inputs).toMatchObject({
      aliases: ['herbercolop.dev', 'www.herbercolop.dev'],
      defaultCacheBehavior: {
        viewerProtocolPolicy: 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD'],
      },
      customErrorResponses: [
        { errorCode: 404, responseCode: 404, responsePagePath: '/404.html' },
      ],
      viewerCertificate: {
        sslSupportMethod: 'sni-only',
        minimumProtocolVersion: 'TLSv1.2_2021',
      },
    });
  });

  it('runs the viewer-request function it ships', () => {
    const fn = find('aws:cloudfront/function:Function').inputs;
    expect(fn).toMatchObject({ runtime: 'cloudfront-js-2.0', publish: true });
    expect(fn['code']).toContain('function handler(event)');
  });

  it('validates the certificate through the existing zone', () => {
    expect(find('aws:acm/certificate:Certificate').inputs).toMatchObject({
      domainName: 'herbercolop.dev',
      subjectAlternativeNames: ['www.herbercolop.dev'],
      validationMethod: 'DNS',
    });
    expect(
      find('aws:route53/record:Record', 'site-validation-www.herbercolop.dev')
        .inputs,
    ).toMatchObject({
      zoneId: ZONE,
      name: '_token.www.herbercolop.dev.',
      type: 'CNAME',
      records: ['_value.acm-validations.aws.'],
    });
  });

  it('points both names at the distribution, over IPv4 and IPv6', () => {
    for (const name of ['herbercolop.dev', 'www.herbercolop.dev']) {
      for (const type of ['a', 'aaaa']) {
        expect(
          find('aws:route53/record:Record', `site-${type}-${name}`).inputs,
        ).toMatchObject({
          zoneId: ZONE,
          name,
          aliases: [{ name: 'dmock.cloudfront.net', zoneId: 'Z2FDTNDATAQYW2' }],
        });
      }
    }
  });
});

describe('the GitHub roles', () => {
  const trust = (name: string) =>
    JSON.parse(
      find('aws:iam/role:Role', name).inputs['assumeRolePolicy'] as string,
    ).Statement[0];

  it('trust pull requests to preview, and only production to deploy', () => {
    expect(trust('github-preview').Condition.StringEquals).toEqual({
      'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
      'token.actions.githubusercontent.com:sub':
        'repo:Herber230/myself-app:pull_request',
    });
    expect(trust('github-deploy').Condition.StringEquals).toEqual({
      'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
      'token.actions.githubusercontent.com:sub':
        'repo:Herber230/myself-app:environment:production',
    });
  });

  it('keep the preview role away from every object but the state', () => {
    const policy = JSON.parse(
      find('aws:iam/rolePolicy:RolePolicy', 'github-preview-policy').inputs[
        'policy'
      ] as string,
    );
    expect(policy.Statement).toContainEqual({
      Sid: 'NoOtherObjects',
      Effect: 'Deny',
      Action: 's3:GetObject',
      NotResource: 'arn:aws:s3:::myself-app-pulumi-state-206772512116/*',
    });
  });

  it('scope the deploy role to its own roles, zone and bucket', () => {
    const statements: { Sid: string; Resource: unknown }[] = JSON.parse(
      find('aws:iam/rolePolicy:RolePolicy', 'github-deploy-policy').inputs[
        'policy'
      ] as string,
    ).Statement;
    const resource = (sid: string) =>
      statements.find(statement => statement.Sid === sid)?.Resource;
    expect(resource('OwnRolesAndProvider')).toEqual([
      `arn:aws:iam::${ACCOUNT}:role/myself-app-*`,
      `arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com`,
    ]);
    expect(resource('SiteZone')).toBe(`arn:aws:route53:::hostedzone/${ZONE}`);
    expect(resource('SiteBucket')).toEqual([
      'arn:aws:s3:::site-bucket-generated',
      'arn:aws:s3:::site-bucket-generated/*',
    ]);
  });
});

describe('the stack outputs', () => {
  it('name what the deploy needs', async () => {
    expect(stack.siteUrl).toBe('https://herbercolop.dev/');
    expect(await resolve(stack.bucketName)).toBe('site-bucket-generated');
    expect(await resolve(stack.distributionId)).toBe('site-distribution-id');
    expect(await resolve(stack.distributionDomain)).toBe(
      'dmock.cloudfront.net',
    );
    expect(await resolve(stack.previewRoleArn)).toBe(
      `arn:aws:mock::${ACCOUNT}:github-preview`,
    );
  });
});
