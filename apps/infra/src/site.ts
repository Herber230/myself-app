import { readFileSync } from 'node:fs';

import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

/**
 * CloudFront's managed policies, by the IDs AWS documents as fixed. Looking
 * them up by name would be a call on every preview for a value that never
 * changes.
 *
 * - `CachingOptimized` honours the object's own `Cache-Control`, which the
 *   deploy sets per path, and compresses with gzip and Brotli.
 * - `SecurityHeadersPolicy` adds HSTS, `nosniff`, frame and referrer policies.
 */
export const CACHING_OPTIMIZED = '658327ea-f89d-4fab-a63d-7e88639e58f6';
export const SECURITY_HEADERS = '67f7725c-6f97-4210-82d7-5512b31e9d03';

const VIEWER_REQUEST = readFileSync(
  new URL('./viewer-request.js', import.meta.url),
  'utf8',
);

export interface SiteArgs {
  /** The apex the site answers on; `www.` redirects to it. */
  domain: string;
}

/**
 * The site: a private bucket, the CloudFront distribution that alone may read
 * it, the certificate, and the DNS records (ADR 0013). The hosted zone is
 * looked up, never created: it came with the domain, and must outlive the
 * stack.
 */
export class Site extends pulumi.ComponentResource {
  readonly bucket: aws.s3.Bucket;
  readonly distribution: aws.cloudfront.Distribution;
  readonly zoneId: pulumi.Output<string>;

  constructor(
    name: string,
    args: SiteArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super('myself-app:hosting:Site', name, {}, opts);
    const parent = { parent: this };
    const aliases = [args.domain, `www.${args.domain}`];

    const zone = aws.route53.getZoneOutput(
      { name: args.domain, privateZone: false },
      parent,
    );
    this.zoneId = zone.zoneId;

    this.bucket = new aws.s3.Bucket(
      `${name}-bucket`,
      { bucketPrefix: 'myself-app-site-' },
      parent,
    );
    new aws.s3.BucketOwnershipControls(
      `${name}-ownership`,
      {
        bucket: this.bucket.id,
        rule: { objectOwnership: 'BucketOwnerEnforced' },
      },
      parent,
    );
    const publicAccess = new aws.s3.BucketPublicAccessBlock(
      `${name}-public-access`,
      {
        bucket: this.bucket.id,
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      parent,
    );

    const certificate = new aws.acm.Certificate(
      `${name}-certificate`,
      {
        domainName: args.domain,
        subjectAlternativeNames: aliases.slice(1),
        validationMethod: 'DNS',
      },
      parent,
    );
    const validationRecords = aliases.map(alias => {
      const option = certificate.domainValidationOptions.apply(options =>
        options.find(candidate => candidate.domainName === alias)!,
      );
      return new aws.route53.Record(
        `${name}-validation-${alias}`,
        {
          zoneId: this.zoneId,
          name: option.resourceRecordName,
          type: option.resourceRecordType,
          records: [option.resourceRecordValue],
          ttl: 300,
          allowOverwrite: true,
        },
        parent,
      );
    });
    const validation = new aws.acm.CertificateValidation(
      `${name}-certificate-validation`,
      {
        certificateArn: certificate.arn,
        validationRecordFqdns: validationRecords.map(record => record.fqdn),
      },
      parent,
    );

    const originAccess = new aws.cloudfront.OriginAccessControl(
      `${name}-origin-access`,
      {
        description: `CloudFront reads ${args.domain}'s bucket`,
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
      parent,
    );
    const viewerRequest = new aws.cloudfront.Function(
      `${name}-viewer-request`,
      {
        runtime: 'cloudfront-js-2.0',
        comment: 'Index documents, folder slashes, www to apex',
        code: VIEWER_REQUEST,
        publish: true,
      },
      parent,
    );

    this.distribution = new aws.cloudfront.Distribution(
      `${name}-distribution`,
      {
        enabled: true,
        comment: args.domain,
        aliases,
        isIpv6Enabled: true,
        httpVersion: 'http2and3',
        priceClass: 'PriceClass_100',
        origins: [
          {
            originId: 'bucket',
            domainName: this.bucket.bucketRegionalDomainName,
            originAccessControlId: originAccess.id,
          },
        ],
        defaultCacheBehavior: {
          targetOriginId: 'bucket',
          viewerProtocolPolicy: 'redirect-to-https',
          allowedMethods: ['GET', 'HEAD'],
          cachedMethods: ['GET', 'HEAD'],
          compress: true,
          cachePolicyId: CACHING_OPTIMIZED,
          responseHeadersPolicyId: SECURITY_HEADERS,
          functionAssociations: [
            { eventType: 'viewer-request', functionArn: viewerRequest.arn },
          ],
        },
        // A missing key is a 404 only because the bucket policy grants
        // `s3:ListBucket`; without it S3 answers 403, and this never fires.
        customErrorResponses: [
          {
            errorCode: 404,
            responseCode: 404,
            responsePagePath: '/404.html',
            errorCachingMinTtl: 60,
          },
        ],
        restrictions: { geoRestriction: { restrictionType: 'none' } },
        viewerCertificate: {
          acmCertificateArn: validation.certificateArn,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.2_2021',
        },
      },
      parent,
    );

    new aws.s3.BucketPolicy(
      `${name}-bucket-policy`,
      {
        bucket: this.bucket.id,
        policy: pulumi.jsonStringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'CloudFrontReads',
              Effect: 'Allow',
              Principal: { Service: 'cloudfront.amazonaws.com' },
              Action: ['s3:GetObject', 's3:ListBucket'],
              Resource: [
                this.bucket.arn,
                pulumi.interpolate`${this.bucket.arn}/*`,
              ],
              Condition: {
                StringEquals: { 'AWS:SourceArn': this.distribution.arn },
              },
            },
          ],
        }),
      },
      // The public access block must be in place before any policy lands.
      { parent: this, dependsOn: [publicAccess] },
    );

    for (const alias of aliases) {
      for (const type of ['A', 'AAAA']) {
        new aws.route53.Record(
          `${name}-${type.toLowerCase()}-${alias}`,
          {
            zoneId: this.zoneId,
            name: alias,
            type,
            aliases: [
              {
                name: this.distribution.domainName,
                zoneId: this.distribution.hostedZoneId,
                evaluateTargetHealth: false,
              },
            ],
          },
          parent,
        );
      }
    }

    this.registerOutputs({
      bucketName: this.bucket.bucket,
      distributionId: this.distribution.id,
    });
  }
}
