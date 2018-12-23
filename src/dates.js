const {
  parse,
  addDays,
  addYears,
  setHours,
  setMinutes,
  setSeconds,
  getDay,
  differenceInDays,
  isValid
} = require("date-fns");

/**
 * Safely parse a date string or Date object.
 * Supports yyyy/MM/dd, yyyy-MM-dd, ISO strings, and standard Date instances.
 * @param {string|Date} input
 * @param {Date} fallback
 * @returns {Date}
 */
function safeParseDate(input, fallback) {
  if (!input) return fallback;
  if (input instanceof Date && isValid(input)) return input;

  if (typeof input === "string") {
    const trimmed = input.trim();

    // Check for DD-MM-YYYY or DD/MM/YYYY (e.g. 07-10-2026)
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (isValid(parsed)) return parsed;
    }

    // Check for YYYY-MM-DD or YYYY/MM/DD (e.g. 2026-10-07)
    const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (isValid(parsed)) return parsed;
    }

    // Normalize slashes to hyphens or parse directly
    const normalized = trimmed.replace(/\//g, "-");
    const parsed = parse(normalized);
    if (isValid(parsed)) return parsed;

    // Direct Date constructor fallback
    const direct = new Date(trimmed);
    if (isValid(direct)) return direct;
  }

  return fallback;
}

/**
 * Inclusive random integer helper
 */
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Normal distribution (Bell curve) using Box-Muller transform
 */
function normalRandom(mean, stdDev) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.round(z * stdDev + mean);
}

/**
 * Work hours pattern - more commits on weekdays during 9am-5pm
 */
function workHoursPattern(date, minCommits, maxCommits) {
  const day = getDay(date); // 0 = Sunday, 6 = Saturday
  const dayMultipliers = [0.1, 0.8, 1.2, 1.3, 1.2, 0.7, 0.1];
  const avgCommits = (parseInt(minCommits, 10) + parseInt(maxCommits, 10)) / 2;
  const adjustedMean = avgCommits * dayMultipliers[day];
  const stdDev = Math.max(0.5, (maxCommits - minCommits) / 4);
  let commits = normalRandom(adjustedMean, stdDev);
  return Math.max(
    parseInt(minCommits, 10),
    Math.min(parseInt(maxCommits, 10), commits)
  );
}

/**
 * After work pattern - more commits on evenings and weekends
 */
function afterWorkPattern(date, minCommits, maxCommits) {
  const day = getDay(date);
  const dayMultipliers = [1.3, 0.6, 0.5, 0.5, 0.7, 0.9, 1.4];
  const avgCommits = (parseInt(minCommits, 10) + parseInt(maxCommits, 10)) / 2;
  const adjustedMean = avgCommits * dayMultipliers[day];
  const stdDev = Math.max(0.5, (maxCommits - minCommits) / 4);
  let commits = normalRandom(adjustedMean, stdDev);
  return Math.max(
    parseInt(minCommits, 10),
    Math.min(parseInt(maxCommits, 10), commits)
  );
}

/**
 * Consistent pattern - moderately regular activity day in, day out
 */
function consistentPattern(date, minCommits, maxCommits) {
  const avg = (minCommits + maxCommits) / 2;
  // Narrow standard deviation around median
  const stdDev = Math.max(0.5, (maxCommits - minCommits) / 6);
  let commits = normalRandom(avg, stdDev);
  return Math.max(minCommits, Math.min(maxCommits, commits));
}

/**
 * Random hour selector according to distribution pattern
 */
function getHourForDistribution(distribution) {
  let hourDistribution;

  if (distribution === "workHours") {
    // 9am to 5pm heavy
    hourDistribution = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      3,
      8,
      12,
      15,
      15,
      14,
      12,
      10,
      8,
      5,
      2,
      1,
      0,
      0,
      0,
      0
    ];
  } else if (distribution === "afterWork") {
    // Evening and weekend heavy
    hourDistribution = [
      3,
      2,
      1,
      0,
      0,
      0,
      1,
      2,
      2,
      2,
      1,
      1,
      1,
      1,
      1,
      2,
      3,
      5,
      10,
      15,
      18,
      15,
      10,
      5
    ];
  } else {
    // Standard developer daytime & evening activity
    hourDistribution = [
      1,
      1,
      0,
      0,
      0,
      0,
      1,
      2,
      5,
      8,
      10,
      12,
      10,
      15,
      18,
      16,
      12,
      8,
      5,
      3,
      2,
      2,
      1,
      1
    ];
  }

  const totalWeight = hourDistribution.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let hour = 0; hour < 24; hour++) {
    random -= hourDistribution[hour];
    if (random <= 0) return hour;
  }
  return 14;
}

/**
 * Calculate commit count and day active status for a given date and distribution
 * @param {Object} params
 * @returns {{ isActive: boolean, count: number }}
 */
function evaluateDayActivity({
  date,
  dayIndex,
  totalDays,
  minCommits,
  maxCommits,
  baseFrequency,
  distribution
}) {
  const progressRatio = totalDays > 0 ? dayIndex / totalDays : 0;

  switch (distribution) {
    case "consistent": {
      // Very regular activity (slight dips on weekends, 85-95% active)
      const dayOfWeek = getDay(date);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const activeChance = isWeekend
        ? Math.min(baseFrequency, 75)
        : Math.min(100, Math.max(baseFrequency, 92));
      const isActive = Math.random() * 100 <= activeChance;
      const count = isActive
        ? consistentPattern(date, minCommits, maxCommits)
        : 0;
      return { isActive, count };
    }

    case "sporadic": {
      // Long quiet gaps (10-25 days) alternating with short bursts (2-5 days)
      const cycleDay = dayIndex % 28;
      const inBurst = cycleDay < 4; // 4 days burst, 24 days quiet
      let activeChance;
      if (inBurst) {
        activeChance = Math.min(100, Math.max(80, baseFrequency));
      } else {
        activeChance = Math.min(15, baseFrequency * 0.15);
      }
      const isActive = Math.random() * 100 <= activeChance;
      const count = isActive
        ? inBurst
          ? getRandomIntInclusive(Math.max(1, minCommits), maxCommits)
          : getRandomIntInclusive(minCommits, Math.max(1, minCommits))
        : 0;
      return { isActive, count };
    }

    case "learning": {
      // Activity ramps up over time, from sparse to frequent
      // progressRatio ranges 0.0 to 1.0
      const activeChance = Math.min(
        100,
        Math.max(15, baseFrequency * (0.3 + 0.7 * progressRatio))
      );
      const isActive = Math.random() * 100 <= activeChance;
      const dynamicMax = Math.max(
        minCommits,
        Math.round(
          minCommits + (maxCommits - minCommits) * (0.4 + 0.6 * progressRatio)
        )
      );
      const count = isActive
        ? getRandomIntInclusive(minCommits, dynamicMax)
        : 0;
      return { isActive, count };
    }

    case "project-based": {
      // Multi-week project sprints separated by quiet interludes
      // 3 weeks (21 days) active, 4 weeks (28 days) quiet
      const cycleLength = 49;
      const inProject = dayIndex % cycleLength < 21;
      const activeChance = inProject
        ? Math.min(100, Math.max(75, baseFrequency))
        : Math.min(20, baseFrequency * 0.2);
      const isActive = Math.random() * 100 <= activeChance;
      const count = isActive
        ? inProject
          ? getRandomIntInclusive(minCommits, maxCommits)
          : getRandomIntInclusive(0, Math.max(1, minCommits))
        : 0;
      return { isActive, count };
    }

    case "workHours": {
      const isActive = Math.random() * 100 <= baseFrequency;
      const count = isActive
        ? workHoursPattern(date, minCommits, maxCommits)
        : 0;
      return { isActive, count };
    }

    case "afterWork": {
      const isActive = Math.random() * 100 <= baseFrequency;
      const count = isActive
        ? afterWorkPattern(date, minCommits, maxCommits)
        : 0;
      return { isActive, count };
    }

    case "human":
    case "organic": {
      const dayOfWeek = getDay(date);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Natural human developer schedule:
      // Weekdays: ~68% base chance, Weekends: ~38% base chance
      const baseChance = isWeekend ? 38 : 68;
      const effectiveChance = Math.min(
        100,
        Math.max(10, baseChance * (baseFrequency / 60))
      );
      const isActive = Math.random() * 100 <= effectiveChance;

      if (!isActive) {
        return { isActive: false, count: 0 };
      }

      // Natural human commit distribution:
      // ~30% light touch / quick fix (1-2 commits)
      // ~45% regular workday (2-4 commits)
      // ~20% active sprint (4-6 commits)
      // ~5% release/heavy day (7-8 commits)
      const roll = Math.random();
      let count;
      if (roll < 0.3) {
        count = getRandomIntInclusive(
          Math.max(1, minCommits),
          Math.min(2, maxCommits)
        );
      } else if (roll < 0.75) {
        count = getRandomIntInclusive(
          Math.min(2, maxCommits),
          Math.min(4, maxCommits)
        );
      } else if (roll < 0.95) {
        count = getRandomIntInclusive(
          Math.min(4, maxCommits),
          Math.min(6, maxCommits)
        );
      } else {
        count = getRandomIntInclusive(Math.min(6, maxCommits), maxCommits);
      }

      return {
        isActive: true,
        count: Math.max(minCommits, Math.min(maxCommits, count))
      };
    }

    case "random": {
      // Pure stochastic variability
      const randomFreq = getRandomIntInclusive(
        Math.max(10, baseFrequency - 30),
        Math.min(100, baseFrequency + 20)
      );
      const isActive = Math.random() * 100 <= randomFreq;
      const count = isActive
        ? getRandomIntInclusive(minCommits, maxCommits)
        : 0;
      return { isActive, count };
    }

    case "uniform":
    default: {
      const isActive = Math.random() * 100 <= baseFrequency;
      const count = isActive
        ? getRandomIntInclusive(minCommits, maxCommits)
        : 0;
      return { isActive, count };
    }
  }
}

/**
 * Creates list of commit dates spanning the requested range.
 * Highly optimized for long historical ranges (8-10 years).
 *
 * @param {Object} options
 * @param {Array<string|number>} [options.commitsPerDay=["0", "4"]]
 * @param {number} [options.frequency=80]
 * @param {Date|string} options.startDate
 * @param {Date|string} options.endDate
 * @param {string} [options.distribution="uniform"]
 * @returns {Array<Date>}
 */
function createCommitDateList({
  commitsPerDay = ["0", "4"],
  frequency = 80,
  startDate,
  endDate,
  distribution = "uniform"
}) {
  const defaultStart = addYears(new Date(), -1);
  const defaultEnd = new Date();

  let start = safeParseDate(startDate, defaultStart);
  let end = safeParseDate(endDate, defaultEnd);

  // If start is after end, normalize them
  if (start > end) {
    [start, end] = [end, start];
  }

  // Parse commitsPerDay bounds
  let minCommits = 0;
  let maxCommits = 4;
  if (Array.isArray(commitsPerDay)) {
    minCommits = parseInt(commitsPerDay[0], 10) || 0;
    maxCommits = parseInt(commitsPerDay[1], 10) || minCommits;
  } else if (typeof commitsPerDay === "string") {
    const parts = commitsPerDay.split(",").map(Number);
    minCommits = parts[0] || 0;
    maxCommits = parts[1] !== undefined ? parts[1] : minCommits;
  }

  if (minCommits > maxCommits) {
    [minCommits, maxCommits] = [maxCommits, minCommits];
  }

  const baseFrequency = Number.isFinite(frequency)
    ? Math.max(0, Math.min(100, frequency))
    : 80;

  const totalDays = differenceInDays(end, start) + 1;
  const commitDateList = [];
  let currentDate = start;

  // Strict cutoff boundary: no commits beyond 23:59:59.999 of the end date
  const cutoffTime = new Date(end);
  cutoffTime.setHours(23, 59, 59, 999);

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const { count } = evaluateDayActivity({
      date: currentDate,
      dayIndex,
      totalDays,
      minCommits,
      maxCommits,
      baseFrequency,
      distribution
    });

    for (let i = 0; i < count; i++) {
      const hour = getHourForDistribution(distribution);
      const dateWithHours = setHours(currentDate, hour);
      const dateWithMinutes = setMinutes(
        dateWithHours,
        getRandomIntInclusive(0, 59)
      );
      const commitDate = setSeconds(
        dateWithMinutes,
        getRandomIntInclusive(0, 59)
      );

      // Strictly ensure commit does not exceed the cutoff date
      if (commitDate.getTime() <= cutoffTime.getTime()) {
        commitDateList.push(commitDate);
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  // Ensure commits are in chronological order
  commitDateList.sort((a, b) => a.getTime() - b.getTime());

  return commitDateList;
}

module.exports = {
  safeParseDate,
  getRandomIntInclusive,
  normalRandom,
  createCommitDateList,
  evaluateDayActivity,
  getHourForDistribution
};
