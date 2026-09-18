import { DATA_FILES, dataFileContent } from '../../../content/data-files';
import { SITE_REPOSITORIES } from '../../../content/repositories';

/**
 * `/data/<entity>.json`, written once into the export (ADR 0003, path C).
 * `force-static` is what a static export allows of a route handler: it runs
 * during `next build` for each file below, and never again.
 */
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return DATA_FILES.map(file => ({ file }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/data/[file]'>,
) {
  const { file } = await params;
  return Response.json(await dataFileContent(SITE_REPOSITORIES, file));
}
