export interface MathExpression {
  original: string;
  display: boolean;
}

/**
 * Protect math expressions from marked processing by replacing them with placeholders.
 * Handles $$...$$ (display) and $...$ (inline) math, skipping escaped \$ and code blocks.
 */
export function protectMath(markdown: string): { text: string; expressions: Map<string, MathExpression> } {
  const expressions = new Map<string, MathExpression>();
  let counter = 0;

  function makePlaceholder(): string {
    return `%%MATH_PLACEHOLDER_${counter++}%%`;
  }

  let text = markdown;

  // First, protect code blocks and inline code from math detection
  const codeBlocks: { placeholder: string; content: string }[] = [];
  let codeCounter = 0;

  // Protect fenced code blocks (```...```)
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `%%CODE_BLOCK_${codeCounter++}%%`;
    codeBlocks.push({ placeholder, content: match });
    return placeholder;
  });

  // Protect inline code (`...`)
  text = text.replace(/`[^`\n]+`/g, (match) => {
    const placeholder = `%%CODE_BLOCK_${codeCounter++}%%`;
    codeBlocks.push({ placeholder, content: match });
    return placeholder;
  });

  // Replace display math $$...$$ (can span multiple lines)
  text = text.replace(/(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$/g, (match, inner) => {
    const placeholder = makePlaceholder();
    expressions.set(placeholder, { original: inner, display: true });
    return placeholder;
  });

  // Replace inline math $...$ (single line, non-greedy, must have non-space content)
  text = text.replace(/(?<!\\)\$(?!\s)((?:[^$\\]|\\.)+?)(?<!\s)\$(?!\d)/g, (match, inner) => {
    const placeholder = makePlaceholder();
    expressions.set(placeholder, { original: inner, display: false });
    return placeholder;
  });

  // Restore code blocks
  for (const { placeholder, content } of codeBlocks) {
    text = text.replace(placeholder, content);
  }

  return { text, expressions };
}

/**
 * Restore math expressions from placeholders, wrapping in MathJax delimiters.
 * Display math uses \[...\], inline math uses \(...\).
 */
export function restoreMath(html: string, expressions: Map<string, MathExpression>): string {
  let result = html;

  for (const [placeholder, expr] of expressions) {
    if (expr.display) {
      result = result.replace(placeholder, `\\[${expr.original}\\]`);
    } else {
      result = result.replace(placeholder, `\\(${expr.original}\\)`);
    }
  }

  return result;
}
