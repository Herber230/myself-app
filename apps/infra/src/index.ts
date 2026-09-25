import * as pulumi from '@pulumi/pulumi';

import { GitHubRoles } from './github.ts';
import { Site } from './site.ts';

/** The GitHub environment `deploy.yml` runs in (ADR 0013). */
const DEPLOY_ENVIRONMENT = 'production';

const config = new pulumi.Config();
const domain = config.require('domain');

const site = new Site('site', { domain });
const roles = new GitHubRoles('github', {
  repository: config.require('githubRepository'),
  environment: DEPLOY_ENVIRONMENT,
  siteBucketArn: site.bucket.arn,
  zoneId: site.zoneId,
});

export const siteUrl = `https://${domain}/`;
export const bucketName = site.bucket.bucket;
export const distributionId = site.distribution.id;
export const distributionDomain = site.distribution.domainName;
export const previewRoleArn = roles.preview.arn;
export const deployRoleArn = roles.deploy.arn;
