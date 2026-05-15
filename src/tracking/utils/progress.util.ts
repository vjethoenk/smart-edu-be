export interface WatchedRange {
  start: number;
  end: number;
}

export function normalizeWatchedRange(
  range: WatchedRange,
): WatchedRange | null {
  if (range.end <= range.start) {
    return null;
  }

  return {
    start: Math.max(0, range.start),
    end: Math.max(range.start, range.end),
  };
}

export function mergeWatchedRanges(
  existingRanges: WatchedRange[],
  newRange: WatchedRange,
): WatchedRange[] {
  const normalized = normalizeWatchedRange(newRange);
  if (!normalized) {
    return existingRanges;
  }

  const ranges = [...existingRanges, normalized].sort(
    (a, b) => a.start - b.start,
  );
  const merged: WatchedRange[] = [];

  for (const range of ranges) {
    if (!merged.length) {
      merged.push({ ...range });
      continue;
    }

    const last = merged[merged.length - 1];
    if (range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

export function calculateWatchedSeconds(ranges: WatchedRange[]): number {
  return ranges.reduce(
    (total, range) => total + Math.max(0, range.end - range.start),
    0,
  );
}

export function getProgressPercent(
  watchedSeconds: number,
  totalDuration: number,
): number {
  if (!totalDuration || totalDuration <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((watchedSeconds / totalDuration) * 100 * 100) / 100,
  );
}
