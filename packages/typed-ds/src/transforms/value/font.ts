import { BaseFactory } from '../../base/factory';
import { FontSizeClass, FontWeightPrimitive, IFont } from '../../base/fonts';
import { MediaSelector, ThemeMedia } from '../../base/media';
import { StringKey } from '../../types';
import { createValueTransform } from './base';
import { normalizeResponsiveArray } from './helpers';

const mapFontProp = <Media extends ThemeMedia, T>(
  prop: T | (readonly [T, string])[],
  isLiteral: boolean
): { [key in '_base' | keyof Media['breakpoints']]?: T } => {
  return isLiteral
    ? {
        _base: prop as T,
      }
    : (prop as [T, string][]).reduce((acc, pair) => {
        return { ...acc, [pair[1]]: pair[0] };
      }, {} as Record<'_base' | keyof Media['breakpoints'], T>);
};

type Font = {
  family: string;
  sizeClass: FontSizeClass;
  weight: FontWeightPrimitive;
};

export const fontTransform = <
  Media extends ThemeMedia,
  Fact extends BaseFactory<Media>
>() =>
  createValueTransform<Media, Fact>()(
    ['font'],
    (value, mediaType, media, factory) => {
      if (typeof value === 'string') {
        const font = factory.fonts.aliases[value as string];

        const family = transformFamily(media, factory, font);
        const sizeClass = transformSizeClasses(media, factory, font);
        const weight = transformWeight(media, factory, font);
        const familyReduce = mapFontProp<Media, string>(
          family,
          typeof family === 'string'
        );
        const sizeClassReduce = mapFontProp<Media, FontSizeClass>(
          sizeClass,
          !Array.isArray(sizeClass[0])
        );
        const weightReduce = mapFontProp<Media, FontWeightPrimitive>(
          weight,
          typeof weight === 'number'
        );

        const families = factory.rank.reduce(
          (acc, rank) => {
            if (
              !familyReduce[rank] &&
              !weightReduce[rank] &&
              !sizeClassReduce[rank]
            ) {
              return acc;
            }
            const next = {
              family: familyReduce[rank] ?? acc.prev.family,
              weight: weightReduce[rank] ?? acc.prev.weight,
              sizeClass: sizeClassReduce[rank] ?? acc.prev.sizeClass,
            };

            return {
              prev: next,
              acc: acc.acc.concat([[next, rank]]),
            };
          },
          {
            prev: {} as Font,
            acc: [],
          } as {
            prev: Font;
            acc: [Font, '_base' | StringKey<keyof Media['breakpoints']>][];
          }
        );

        return families.acc;
      }
      return [];
    }
  );

const transformFamily = <
  Media extends ThemeMedia,
  Fact extends BaseFactory<Media>
>(
  media: <T>() => MediaSelector<T, Media>,
  factory: Fact,
  font: IFont<Media, Fact['fonts']['properties']>
) => {
  if (typeof font.family === 'string') {
    return factory.fonts.properties.family[font.family];
  }
  const values = normalizeResponsiveArray(font.family(media()));
  return values.map(
    val => [factory.fonts.properties.family[val[0]], val[1]] as const
  );
};

const transformSizeClasses = <
  Media extends ThemeMedia,
  Fact extends BaseFactory<Media>
>(
  media: <T>() => MediaSelector<T, Media>,
  factory: Fact,
  font: IFont<Media, Fact['fonts']['properties']>
) => {
  if (typeof font.sizeClass === 'string') {
    return factory.fonts.properties.sizeClass[font.sizeClass];
  }
  const values = normalizeResponsiveArray(font.sizeClass(media()));
  return values.map(
    val => [factory.fonts.properties.sizeClass[val[0]], val[1]] as const
  );
};

const transformWeight = <
  Media extends ThemeMedia,
  Fact extends BaseFactory<Media>
>(
  media: <T>() => MediaSelector<T, Media>,
  factory: Fact,
  font: IFont<Media, Fact['fonts']['properties']>
) => {
  if (typeof font.weight === 'string') {
    return factory.fonts.properties.weight[font.weight];
  }
  const values = normalizeResponsiveArray(font.weight(media()));
  return values.map(
    val => [factory.fonts.properties.weight[val[0]], val[1]] as const
  );
};
