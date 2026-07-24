import React from 'react';
import { Text } from 'react-native';

interface HTMLTextProps {
  html: string;
  style?: any;
}

export function HTMLText({ html, style }: HTMLTextProps) {
  if (!html) return null;

  // Reemplazar saltos de línea literales (\r y \n) por espacios para simular el comportamiento de HTML en navegadores
  const normalizedHtml = html.replace(/[\r\n]+/g, ' ');

  // Decodifica las entidades HTML más comunes
  let text = normalizedHtml
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Uuml;/g, 'Ü');

  // Regex para separar etiquetas HTML del texto normal
  const tagRegex = /(<\/?[a-zA-Z0-9]+[^>]*>)/g;
  const parts = text.split(tagRegex);

  const elements: React.ReactNode[] = [];
  let currentKey = 0;

  // Pila de estilos heredados para renderizar etiquetas anidadas
  const styleStack: any[] = [style || { color: '#FFFFFF', fontSize: 13, lineHeight: 22 }];
  let isOrderedList = false;
  let orderedListIndex = 1;

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('<') && part.endsWith('>')) {
      const lowerPart = part.toLowerCase();

      if (lowerPart.startsWith('<div') || lowerPart.startsWith('<p')) {
        if (elements.length > 0) {
          elements.push(<Text key={`nl-${currentKey++}`}>{'\n'}</Text>);
        }
        const styleMatch = part.match(/style="([^"]*)"/i);
        if (styleMatch) {
          const parsedStyle = parseInlineStyle(styleMatch[1]);
          styleStack.push({ ...styleStack[styleStack.length - 1], ...parsedStyle });
        } else {
          styleStack.push(styleStack[styleStack.length - 1]);
        }
      } else if (lowerPart.startsWith('</div') || lowerPart.startsWith('</p')) {
        if (styleStack.length > 1) styleStack.pop();
      } else if (lowerPart.startsWith('<span')) {
        const styleMatch = part.match(/style="([^"]*)"/i);
        if (styleMatch) {
          const parsedStyle = parseInlineStyle(styleMatch[1]);
          styleStack.push({ ...styleStack[styleStack.length - 1], ...parsedStyle });
        } else {
          styleStack.push(styleStack[styleStack.length - 1]);
        }
      } else if (lowerPart.startsWith('</span')) {
        if (styleStack.length > 1) styleStack.pop();
      } else if (lowerPart.startsWith('<ol')) {
        isOrderedList = true;
        orderedListIndex = 1;
      } else if (lowerPart.startsWith('</ol')) {
        isOrderedList = false;
      } else if (lowerPart.startsWith('<ul')) {
        isOrderedList = false;
      } else if (lowerPart.startsWith('<li')) {
        if (elements.length > 0) {
          elements.push(<Text key={`nl-${currentKey++}`}>{'\n'}</Text>);
        }
        if (isOrderedList) {
          elements.push(<Text key={`bullet-${currentKey++}`} style={styleStack[styleStack.length - 1]}>{orderedListIndex++}. </Text>);
        } else {
          elements.push(<Text key={`bullet-${currentKey++}`} style={styleStack[styleStack.length - 1]}>• </Text>);
        }
      } else if (lowerPart.startsWith('<strong') || lowerPart.startsWith('<b')) {
        styleStack.push({ ...styleStack[styleStack.length - 1], fontWeight: 'bold' });
      } else if (lowerPart.startsWith('</strong') || lowerPart.startsWith('</b')) {
        if (styleStack.length > 1) styleStack.pop();
      } else if (lowerPart.startsWith('<em') || lowerPart.startsWith('</i')) {
        styleStack.push({ ...styleStack[styleStack.length - 1], fontStyle: 'italic' });
      } else if (lowerPart.startsWith('</em') || lowerPart.startsWith('</i')) {
        if (styleStack.length > 1) styleStack.pop();
      } else if (lowerPart.startsWith('<br')) {
        elements.push(<Text key={`br-${currentKey++}`}>{'\n'}</Text>);
      }
    } else {
      elements.push(
        <Text key={`text-${currentKey++}`} style={{ ...styleStack[styleStack.length - 1] }}>
          {part}
        </Text>
      );
    }
  }

  return <Text style={style}>{elements}</Text>;
}

function parseInlineStyle(styleStr: string): any {
  const styles: any = {};
  if (!styleStr) return styles;
  const declarations = styleStr.split(';');
  for (const decl of declarations) {
    const parts = decl.split(':');
    if (parts.length === 2) {
      const key = parts[0].trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const val = parts[1].trim();

      if (key === 'color' || key === 'backgroundColor') {
        styles[key] = val;
      } else if (key === 'fontWeight') {
        styles[key] = val;
      } else if (key === 'fontStyle') {
        styles[key] = val;
      }
    }
  }
  return styles;
}
