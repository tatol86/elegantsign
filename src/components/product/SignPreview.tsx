'use client';

import { useId } from 'react';
import type { CSSProperties, SVGProps } from 'react';
import type { Product, ProductPersonalization, SizeOption } from '@/types/catalog';

type SignPreviewProps = {
  product: Pick<Product, 'category' | 'buildStyle' | 'shape'>;
  selectedColor?: string;
  personalization?: ProductPersonalization;
  size?: Pick<SizeOption, 'width' | 'height'> | null;
  className?: string;
};

const SVG_BASE_SIZE = 500;

function isPreviewSupported(product: Pick<Product, 'category' | 'buildStyle'>) {
  return product.category.includes('House Number') || product.category === 'Custom Text';
}

function getPreviewColors(selectedColor?: string) {
  let backgroundColor = '#111111';
  let foregroundColor = '#f0f0f0';
  const normalizedColor = selectedColor?.toLowerCase() ?? '';

  if (normalizedColor.includes('black on white') || normalizedColor.includes('white')) {
    backgroundColor = '#f8f9fa';
    foregroundColor = '#111111';
  }

  if (
    normalizedColor.includes('white on') ||
    normalizedColor.includes('on black') ||
    normalizedColor.includes('matte black') ||
    normalizedColor.includes('black')
  ) {
    if (!normalizedColor.includes('on white')) {
      backgroundColor = '#111111';
      foregroundColor = '#f0f0f0';
    }
  }

  if (normalizedColor.includes('gold')) {
    foregroundColor = '#d4a853';
  }

  if (normalizedColor.includes('silver')) {
    foregroundColor = '#c0c0c0';
  }

  return { backgroundColor, foregroundColor };
}

function getFontFamily(font?: ProductPersonalization['font']) {
  switch (font) {
    case 'serif':
      return 'Georgia, serif';
    case 'stencil':
      return '"Allerta Stencil", "Arial Black", sans-serif';
    case 'mono':
      return '"Courier New", monospace';
    default:
      return '"Helvetica Neue", Arial, sans-serif';
  }
}

function buildShape(
  shape: Product['shape'],
  width: number,
  height: number,
  fill: string,
  offset = 0,
  shadow = false,
) {
  const commonProps = shadow ? { opacity: 0.6 } : {};
  const cornerRadius = Math.min(width, height) * 0.08;
  const actualShape = shape || 'Rectangle';

  switch (actualShape) {
    case 'Circle': {
      const dimension = Math.min(width, height);
      const radius = dimension / 2 - 2;
      const centerX = width / 2 + offset;
      const centerY = height / 2 + offset;

      return <circle cx={centerX} cy={centerY} r={radius} fill={fill} {...commonProps} />;
    }
    case 'Arch': {
      const radius = width / 2;
      const path = `M ${offset} ${height + offset} L ${offset} ${radius + offset} A ${radius} ${radius} 0 0 1 ${
        width + offset
      } ${radius + offset} L ${width + offset} ${height + offset} Z`;

      return <path d={path} fill={fill} {...commonProps} />;
    }
    case 'Rounded Rectangle':
      return (
        <rect
          x={offset}
          y={offset}
          width={width}
          height={height}
          rx={cornerRadius}
          ry={cornerRadius}
          fill={fill}
          {...commonProps}
        />
      );
    case 'Square':
    case 'Rectangle':
    default:
      return <rect x={offset} y={offset} width={width} height={height} fill={fill} {...commonProps} />;
  }
}

function SignPreview({
  product,
  selectedColor,
  personalization,
  size,
  className,
}: SignPreviewProps) {
  const previewId = useId();

  if (!isPreviewSupported(product)) {
    return null;
  }

  const width = size?.width ?? 300;
  const height = size?.height ?? 150;
  const maxDimension = Math.max(width, height);
  const scale = SVG_BASE_SIZE / maxDimension;
  const displayWidth = width * scale;
  const displayHeight = height * scale;
  const shape = personalization?.shape || product.shape || 'Rectangle';
  const fontFamily = getFontFamily(personalization?.font);
  const { backgroundColor, foregroundColor } = getPreviewColors(selectedColor);
  const primaryText = personalization?.text1 || '12';
  const secondaryText = personalization?.text2 || '';
  const textAnchor = personalization?.layout === 'left' ? 'start' : 'middle';
  const offsetX = personalization?.layout === 'left' ? displayWidth * 0.12 : displayWidth / 2;
  const mainFontSize = Math.min(displayWidth * 0.35, displayHeight * 0.55);
  const secondaryFontSize = Math.min(displayWidth * 0.1, mainFontSize * 0.35);
  const layerOffset = product.buildStyle === 'Double Layer' ? 6 : 0;
  const mainTextY = secondaryText ? displayHeight / 2 - mainFontSize * 0.15 : displayHeight / 2;
  const secondaryTextY = secondaryText
    ? displayHeight / 2 + secondaryFontSize * 1.5
    : displayHeight / 2;
  const filterId = `${previewId}-sign-shadow-${shape.replace(/\s+/g, '-').toLowerCase()}`;
  const viewBoxWidth = displayWidth + layerOffset * 2;
  const viewBoxHeight = displayHeight + layerOffset * 2;
  const textStyle: CSSProperties = {
    fontFamily,
    fontWeight: 700,
  };

  const commonTextProps: SVGProps<SVGTextElement> = {
    fill: foregroundColor,
    textAnchor,
    dominantBaseline: 'middle',
    style: textStyle,
  };

  const isRaised = product.buildStyle === '3D Raised';

  return (
    <div className={className}>
      <svg
        width="100%"
        height="100%"
        viewBox={`${-layerOffset} ${-layerOffset} ${viewBoxWidth} ${viewBoxHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.25)" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {product.buildStyle === 'Double Layer'
            ? buildShape(shape, displayWidth, displayHeight, '#333333', layerOffset, true)
            : null}
          {buildShape(shape, displayWidth, displayHeight, backgroundColor)}
          {isRaised
            ? primaryText.split('').map((character, index, characters) => {
                const characterSpacing = mainFontSize * 0.75;
                const totalWidth = characters.length * characterSpacing;
                const characterX =
                  displayWidth / 2 - totalWidth / 2 + characterSpacing * 0.4 + index * characterSpacing;

                return (
                  <g key={`${character}-${index}`}>
                    <text
                      x={characterX}
                      y={mainTextY + 3}
                      fontSize={mainFontSize}
                      fill="rgba(0,0,0,0.3)"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={textStyle}
                    >
                      {character}
                    </text>
                    <text
                      x={characterX}
                      y={mainTextY}
                      fontSize={mainFontSize}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={textStyle}
                      fill={foregroundColor}
                    >
                      {character}
                    </text>
                  </g>
                );
              })
            : (
                <text x={offsetX} y={mainTextY} fontSize={mainFontSize} {...commonTextProps}>
                  {primaryText}
                </text>
              )}
          {secondaryText ? (
            <text
              x={offsetX}
              y={secondaryTextY}
              fontSize={secondaryFontSize}
              letterSpacing="3"
              {...commonTextProps}
            >
              {secondaryText}
            </text>
          ) : null}
        </g>
      </svg>
    </div>
  );
}

export { isPreviewSupported };
export default SignPreview;
