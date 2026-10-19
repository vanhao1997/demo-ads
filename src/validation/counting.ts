import type { CountingStrategy } from '../domain'

type SegmenterConstructor = new (
  locale?: string,
  options?: { granularity: 'grapheme' | 'word' | 'sentence' },
) => { segment(input: string): Iterable<{ segment: string }> }

function graphemes(input: string): string[] {
  const maybeIntl = Intl as typeof Intl & { Segmenter?: SegmenterConstructor }
  if (maybeIntl.Segmenter) {
    const segmenter = new maybeIntl.Segmenter(undefined, { granularity: 'grapheme' })
    return Array.from(segmenter.segment(input), (item) => item.segment)
  }
  return Array.from(input)
}

function hasCjk(segment: string): boolean {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(segment)
}

export function countTextUnits(input: string, strategy: CountingStrategy = 'grapheme'): number {
  if (strategy === 'utf16') return input.length
  if (strategy === 'code_point') return Array.from(input).length
  const units = graphemes(input)
  if (strategy === 'cjk_weighted') {
    return units.reduce((total, unit) => total + (hasCjk(unit) ? 2 : 1), 0)
  }
  return units.length
}

export function truncateTextUnits(
  input: string,
  max: number,
  strategy: CountingStrategy = 'grapheme',
): string {
  let output = ''
  for (const segment of graphemes(input)) {
    const next = `${output}${segment}`
    if (countTextUnits(next, strategy) > max) break
    output = next
  }
  return output
}
