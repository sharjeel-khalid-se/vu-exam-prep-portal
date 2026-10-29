'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'div' | 'span' | 'p';
}

const SAFE_HTML_TAG_REGEX = /(<\/?(?:p|strong|b|em|i|u|s|strike|del|ins|mark|small|sub|sup|ol|ul|li|br|hr|table|thead|tbody|tfoot|tr|th|td|div|span|h[1-6]|blockquote|pre|code)(?:\s+[a-zA-Z0-9_\-:.]+(?:=(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*\s*\/?>)/gi;

const HAS_BLOCK_HTML_REGEX = /<\/?(?:p|ol|ul|li|table|thead|tbody|tr|th|td|div|h[1-6]|blockquote)\b/i;

const MATH_REGEX = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\s)[^$\n]+?(?<!\s)\$|\\begin\{(?:equation|align|aligned|gather|matrix|pmatrix|bmatrix|vmatrix|cases)\*?\}[\s\S]*?\\end\{(?:equation|align|aligned|gather|matrix|pmatrix|bmatrix|vmatrix|cases)\*?\}|<math[\s\S]*?<\/math>)/g;

function escapeText(str: string): string {
  return str
    .replace(/&(?!(?:[a-zA-Z]+|#[0-9]+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatAsciiEquation(mathStr: string): string {
  let s = mathStr.trim();

  // Replace special characters / Greek
  s = s.replace(/Σ/g, '\\sum ');
  s = s.replace(/X̄c/g, '\\bar{X}_c');
  s = s.replace(/X̄(\d*)/g, (_, d) => d ? `\\bar{X}_{${d}}` : '\\bar{X}');
  s = s.replace(/·/g, ' \\cdot ');
  s = s.replace(/×/g, ' \\times ');
  s = s.replace(/²/g, '^2');
  s = s.replace(/³/g, '^3');

  // Replace en-dash / em-dash with minus sign
  s = s.replace(/[\u2013\u2014]/g, '-');

  // Subscripts: Q1 -> Q_1, P75 -> P_{75}, D5 -> D_5, fm -> f_m, f1 -> f_1, f2 -> f_2, n1 -> n_1, n2 -> n_2, X0 -> X_0, Xm -> X_m
  s = s.replace(/\b([QDP])(\d+)\b/g, '$1_{$2}');
  s = s.replace(/\b([fnX])([123456789m0])\b/g, '$1_{$2}');

  // Common keywords to \text{...}
  s = s.replace(/\b(Median|Mean|Mode|Position|H\.M\.|G\.M\.|A\.M\.|AM|GM|HM|antilog|log)\b/g, '\\text{$1}');

  // Replace * with \times (or remove before parenthesis)
  s = s.replace(/\s*\*\s*(?=\()/g, ' ');
  s = s.replace(/\s*\*\s*/g, ' \\times ');

  // Fractions:
  // 1. ( a / b ) -> \frac{a}{b}
  s = s.replace(/\(\s*([0-9a-zA-Z_.\s]+?)\s*\/\s*([0-9a-zA-Z_.\s]+?)\s*\)/g, '\\frac{$1}{$2}');

  // 2. ( n/2 - c ) -> \left(\frac{n}{2} - c\right)
  s = s.replace(/\(\s*([0-9a-zA-Z_]+)\s*\/\s*([0-9a-zA-Z_]+)\s*([+\-])\s*([0-9a-zA-Z_]+)\s*\)/g, '\\left(\\frac{$1}{$2} $3 $4\\right)');

  // 3. ( 3n/4 - c ) -> \left(\frac{3n}{4} - c\right)
  s = s.replace(/\(\s*([0-9a-zA-Z_]+)\s*\/\s*([0-9a-zA-Z_]+)\s*([+\-])\s*([0-9a-zA-Z_]+)\s*\)/g, '\\left(\\frac{$1}{$2} $3 $4\\right)');

  // 4. Standalone a / b like 30 / 2 or n / 2 or 41 / 2 or 144 / 16
  s = s.replace(/(?<=\s|=)([0-9a-zA-Z_]+)\s*\/\s*([0-9a-zA-Z_]+)(?=\s|=|$)/g, '\\frac{$1}{$2}');

  return s;
}

export function autoConvertAsciiMathText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  const lines = rawText.split('\n');
  const transformed = lines.map(line => {
    // If the line already has LaTeX math delimiters, is a table line, or contains HTML tags, don't touch it
    if (
      line.includes('$$') ||
      line.includes('\\[') ||
      line.includes('\\(') ||
      line.includes('$') ||
      line.includes('|') ||
      line.includes('<')
    ) {
      return line;
    }

    // Check if line is a bullet with an equation, e.g. "• Position = n / 2 = 30 / 2 = 15"
    const bulletMatch = line.match(/^(\s*[•\-*]\s*)(Position\s*=.*|[A-Za-z0-9_]+\s*=\s*[0-9a-zA-Z_].*)$/);
    if (bulletMatch) {
      const prefix = bulletMatch[1];
      const eq = bulletMatch[2];
      if (/[=/*+\-]/.test(eq) && !/is\s+|are\s+|than\s+|from\s+/i.test(eq)) {
        return `${prefix}$${formatAsciiEquation(eq)}$`;
      }
    }

    // Standalone equation line
    const trimmed = line.trim();
    if (
      trimmed.includes('=') &&
      /^(Median|Mode|Mean|Q[123]|P\d+|D\d+|X̄c|X̄|AM|GM|HM|Position)\b/i.test(trimmed) &&
      !/is\s+|are\s+|than\s+|from\s+|between\s+/i.test(trimmed)
    ) {
      return `$$${formatAsciiEquation(trimmed)}$$`;
    }

    // Isolated option formula like "l + (h/f) * (n/2 - c)"
    if (
      /^[a-zA-Z0-9_\s+\-*/=()·×²³]+$/.test(trimmed) &&
      (/[/*+\-]/.test(trimmed) || /=\s*/.test(trimmed)) &&
      trimmed.length > 2 &&
      trimmed.length < 100 &&
      !/^(true|false|none|all of the above|both a and b|data is arranged)$/i.test(trimmed) &&
      /\b([lhfc]|Mode|Mean|Median|Q[123]|P\d+|D\d+)\b/.test(trimmed)
    ) {
      return `$${formatAsciiEquation(trimmed)}$`;
    }

    return line;
  });

  return transformed.join('\n');
}

function renderMathSegment(segment: string): string {
  if (!segment) return '';

  let mathContent: string | null = null;
  let isDisplayMode = false;

  if (segment.startsWith('$$') && segment.endsWith('$$') && segment.length >= 4) {
    mathContent = segment.slice(2, -2);
    isDisplayMode = true;
  } else if (segment.startsWith('\\[') && segment.endsWith('\\]') && segment.length >= 4) {
    mathContent = segment.slice(2, -2);
    isDisplayMode = true;
  } else if (segment.startsWith('\\(') && segment.endsWith('\\)') && segment.length >= 4) {
    mathContent = segment.slice(2, -2);
    isDisplayMode = false;
  } else if (segment.startsWith('\\begin{') && segment.includes('\\end{')) {
    mathContent = segment;
    isDisplayMode = true;
  } else if (segment.startsWith('<math') && segment.endsWith('</math>')) {
    return segment;
  } else if (segment.startsWith('$') && segment.endsWith('$') && segment.length >= 2) {
    mathContent = segment.slice(1, -1);
    isDisplayMode = false;
  }

  if (mathContent !== null) {
    try {
      mathContent = mathContent.replace(/[\u2013\u2014]/g, '-');
      return katex.renderToString(mathContent.trim(), {
        displayMode: isDisplayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
        trust: true,
      });
    } catch {
      return escapeText(segment);
    }
  }

  return escapeText(segment);
}

function renderMarkdownTable(tableLines: string[]): string {
  if (!tableLines || tableLines.length === 0) return '';

  // Filter out separator lines like |---|---|
  const validLines = tableLines.filter(l => !/^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(l));
  if (validLines.length === 0) return '';

  const headerCells = validLines[0].split('|').map(c => c.trim()).filter(c => c.length > 0);
  const rowLines = validLines.slice(1);

  let html = '<div class="my-2.5 overflow-x-auto"><table class="border-collapse border border-purple-200 text-sm shadow-xs rounded-lg overflow-hidden bg-white text-slate-800 mx-auto min-w-[280px] w-full max-w-xl">';

  // Header
  html += '<thead><tr class="bg-purple-800 text-white">';
  for (const h of headerCells) {
    const hContent = renderMathToHtml(h);
    html += `<th class="border border-purple-700 px-3 py-1.5 text-center font-bold text-xs uppercase tracking-wider">${hContent}</th>`;
  }
  html += '</tr></thead>';

  // Body
  html += '<tbody class="divide-y divide-purple-100">';
  for (const r of rowLines) {
    const cells = r.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length === 0) continue;
    html += '<tr class="even:bg-purple-50/40 hover:bg-purple-50 transition-colors">';
    for (const cell of cells) {
      const cellContent = renderMathToHtml(cell);
      html += `<td class="border border-purple-100 px-3 py-1.5 text-center font-medium text-xs sm:text-sm text-slate-700">${cellContent}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

function convertMarkdownTables(text: string): string {
  if (!text || !text.includes('|')) return text;
  // If the text contains an HTML table, don't attempt markdown table conversion
  if (/<table\b/i.test(text)) return text;

  const lines = text.split('\n');
  const result: string[] = [];
  let currentTable: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // A line is considered part of a markdown table if it has at least one '|' and is not a pure math equation line
    if (line.includes('|') && line.trim().length > 2 && !/^\$\$[\s\S]*?\$\$$/.test(line.trim())) {
      currentTable.push(line);
    } else {
      if (currentTable.length > 0) {
        result.push(renderMarkdownTable(currentTable));
        currentTable = [];
      }
      result.push(line);
    }
  }

  if (currentTable.length > 0) {
    result.push(renderMarkdownTable(currentTable));
  }

  return result.join('\n');
}

export function renderMathToHtml(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  // Clean MathType export comments if present
  let cleaned = rawText.replace(/<!--\s*MathType[\s\S]*?-->/gi, '');

  // Pre-process ASCII formulas on lines without HTML
  cleaned = autoConvertAsciiMathText(cleaned);

  // Convert markdown tables if present
  cleaned = convertMarkdownTables(cleaned);

  const hasBlockHtml = HAS_BLOCK_HTML_REGEX.test(cleaned);

  // If text contains HTML blocks, collapse redundant newlines between tags
  if (hasBlockHtml) {
    cleaned = cleaned.replace(/(>)\s*\n+\s*(<)/g, '$1\n$2');
  }

  // Split by LaTeX math delimiters first
  const mathParts = cleaned.split(MATH_REGEX);
  const result: string[] = [];

  for (const part of mathParts) {
    if (!part) continue;

    // Check if part is a LaTeX math delimiter
    if (
      (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) ||
      (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4) ||
      (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4) ||
      (part.startsWith('\\begin{') && part.includes('\\end{')) ||
      (part.startsWith('<math') && part.endsWith('</math>')) ||
      (part.startsWith('$') && part.endsWith('$') && part.length >= 2)
    ) {
      result.push(renderMathSegment(part));
    } else {
      // Non-math segment: split by safe HTML tags
      const htmlParts = part.split(SAFE_HTML_TAG_REGEX);
      for (const hPart of htmlParts) {
        if (!hPart) continue;
        if (SAFE_HTML_TAG_REGEX.test(hPart)) {
          SAFE_HTML_TAG_REGEX.lastIndex = 0;
          result.push(hPart);
        } else {
          SAFE_HTML_TAG_REGEX.lastIndex = 0;
          let escaped = escapeText(hPart);
          // For purely plain text (without HTML blocks), convert \n to <br />
          if (!hasBlockHtml) {
            escaped = escaped.replace(/\n/g, '<br />');
          }
          result.push(escaped);
        }
      }
    }
  }

  return result.join('');
}

export default function MathText({ text, className = '', as }: MathTextProps) {
  const html = useMemo(() => renderMathToHtml(text), [text]);

  const hasBlock = useMemo(
    () => HAS_BLOCK_HTML_REGEX.test(text || '') || (typeof text === 'string' && text.includes('\n')),
    [text]
  );
  const Tag = as || (hasBlock ? 'div' : 'span');

  return (
    <Tag
      className={`math-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
