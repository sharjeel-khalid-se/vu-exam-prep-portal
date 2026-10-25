'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'div' | 'span' | 'p';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
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
    // If the line already has LaTeX math delimiters or is a table line, don't touch it
    if (line.includes('$$') || line.includes('\\[') || line.includes('\\(') || line.includes('$') || line.includes('|')) {
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

  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$(?!\s)[^$\n]+?(?<!\s)\$|\\begin\{(?:equation|align|aligned|gather|matrix|pmatrix|bmatrix|vmatrix|cases)\*?\}[\s\S]*?\\end\{(?:equation|align|aligned|gather|matrix|pmatrix|bmatrix|vmatrix|cases)\*?\}|<math[\s\S]*?<\/math>)/g;

  const parts = segment.split(regex);
  const result: string[] = [];

  for (const part of parts) {
    if (!part) continue;

    let mathContent: string | null = null;
    let isDisplayMode = false;

    if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
      mathContent = part.slice(2, -2);
      isDisplayMode = true;
    } else if (part.startsWith('\\[') && part.endsWith('\\]') && part.length >= 4) {
      mathContent = part.slice(2, -2);
      isDisplayMode = true;
    } else if (part.startsWith('\\(') && part.endsWith('\\)') && part.length >= 4) {
      mathContent = part.slice(2, -2);
      isDisplayMode = false;
    } else if (part.startsWith('\\begin{') && part.includes('\\end{')) {
      mathContent = part;
      isDisplayMode = true;
    } else if (part.startsWith('<math') && part.endsWith('</math>')) {
      result.push(part);
      continue;
    } else if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      mathContent = part.slice(1, -1);
      isDisplayMode = false;
    }

    if (mathContent !== null) {
      try {
        const rendered = katex.renderToString(mathContent.trim(), {
          displayMode: isDisplayMode,
          throwOnError: false,
          output: 'htmlAndMathml',
          trust: true,
        });
        result.push(rendered);
      } catch {
        result.push(escapeHtml(part));
      }
    } else {
      result.push(escapeHtml(part));
    }
  }

  return result.join('');
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
    const hContent = renderMathSegment(h);
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
      const cellContent = renderMathSegment(cell);
      html += `<td class="border border-purple-100 px-3 py-1.5 text-center font-medium text-xs sm:text-sm text-slate-700">${cellContent}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

export function renderMathToHtml(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  // Clean MathType export comments if present
  let cleaned = rawText.replace(/<!--\s*MathType[\s\S]*?-->/gi, '');

  // Pre-process ASCII formulas
  cleaned = autoConvertAsciiMathText(cleaned);

  // Parse lines: identify tables and regular paragraphs
  const lines = cleaned.split('\n');
  const resultBlocks: string[] = [];
  let currentTable: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // A line is considered part of a table if it has at least one '|' and is not a pure math equation line
    if (line.includes('|') && line.trim().length > 2 && !/^\$\$[\s\S]*?\$\$$/.test(line.trim())) {
      currentTable.push(line);
    } else {
      if (currentTable.length > 0) {
        resultBlocks.push(renderMarkdownTable(currentTable));
        currentTable = [];
      }
      resultBlocks.push(renderMathSegment(line));
    }
  }

  if (currentTable.length > 0) {
    resultBlocks.push(renderMarkdownTable(currentTable));
  }

  let fullHtml = '';
  for (let i = 0; i < resultBlocks.length; i++) {
    const b = resultBlocks[i];
    if (!b && b !== '') continue;
    if (fullHtml === '') {
      fullHtml = b;
    } else {
      const prevEndsWithDiv = fullHtml.endsWith('</div>');
      const curStartsWithDiv = b.startsWith('<div');
      if (prevEndsWithDiv || curStartsWithDiv) {
        fullHtml += b;
      } else {
        fullHtml += '<br />' + b;
      }
    }
  }
  return fullHtml;
}

export default function MathText({ text, className = '', as = 'span' }: MathTextProps) {
  const html = useMemo(() => renderMathToHtml(text), [text]);

  const Tag = as;
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
