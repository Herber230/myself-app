/**
 * What the layers diagram shows of a project's packages, translated at build
 * (ADR 0022).
 */
import {
  localize,
  type LocalizedText,
  type ProjectPath,
} from '@myself-app/domain';
import type { ProjectLayers } from '@myself-app/domain/use-cases';
import { targetsOf } from '@myself-app/entifix-incubator-static-adapter';

import type { siteT } from '../../i18n/server.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import type { LayersView, PackageLayersCopy } from './package-layers.js';

type T = ReturnType<typeof siteT>;

/**
 * The layers as the diagram draws them: a band per layer, a box per package
 * with its folder (one of `paths`) and note (its own, else its folder's), its imports, the
 * imports refused, and the project's folders no package names.
 */
export function layersViewOf(
  layers: ProjectLayers,
  paths: readonly ProjectPath[],
  locale: SiteLocale,
): LayersView {
  const text = (value: LocalizedText | undefined) =>
    localize(value as LocalizedText, locale);
  // A package's folder is one of the project's paths, named by id.
  const pathById = new Map(paths.map(path => [String(path.id), path]));
  const folderOf = (box: (typeof layers.packages)[number]) =>
    box.folder.id === undefined
      ? undefined
      : pathById.get(String(box.folder.id));
  const named = new Set(
    layers.packages.flatMap(box => {
      const folder = folderOf(box);
      return folder === undefined ? [] : [String(folder.id)];
    }),
  );
  return {
    bands: layers.layers.map(layer => text(layer.name)),
    boxes: layers.packages.map(box => {
      const folder = folderOf(box);
      return {
        id: String(box.id),
        label: box.label,
        // Loaded by its layer, so its layer is one of the bands.
        band: layers.layers.findIndex(layer => layer.id === box.layer.id),
        column: box.column,
        ...(folder && { path: folder.path }),
        // The rule `folderOrNote` holds one of them.
        note: text(box.note ?? folder?.note),
      };
    }),
    imports: layers.packages.flatMap(box =>
      targetsOf(box.imports).map(target => ({
        from: String(box.id),
        to: String(target.id),
      })),
    ),
    refused: layers.refused.map(edge => ({
      from: String(edge.from.id),
      to: String(edge.to.id),
      reason: text(edge.reason),
    })),
    around: paths
      .filter(path => !named.has(String(path.id)))
      .map(path => ({ path: path.path, note: text(path.note) })),
  };
}

/** The diagram's own words. */
export function layersCopyOf(t: T): PackageLayersCopy {
  return {
    label: t('projectPage.layers.label'),
    hint: t('projectPage.layers.hint'),
    showRefused: t('projectPage.layers.showRefused'),
    allowed: t('projectPage.layers.allowed'),
    refused: t('projectPage.layers.refused'),
    imports: t('projectPage.layers.imports'),
    importedBy: t('projectPage.layers.importedBy'),
    nothing: t('projectPage.layers.nothing'),
    around: t('projectPage.layers.around'),
    pair: t('projectPage.layers.pair', { from: '{{from}}', to: '{{to}}' }),
  };
}
