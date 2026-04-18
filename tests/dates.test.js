const test = require("node:test");
const assert = require("node:assert");
const {
  safeParseDate,
  createCommitDateList,
  evaluateDayActivity,
  getRandomIntInclusive,
  getHourForDistribution
} = require("../src/dates");

test("safeParseDate parses standard formats and handles fallbacks", () => {
  const fallback = new Date(2020, 0, 1);
  const parsedDash = safeParseDate("2024-05-15", fallback);
  assert.strictEqual(parsedDash.getFullYear(), 2024);
  assert.strictEqual(parsedDash.getMonth(), 4); // May = 4

  const parsedSlash = safeParseDate("2023/12/25", fallback);
  assert.strictEqual(parsedSlash.getFullYear(), 2023);

  const parsedDmy = safeParseDate("07-10-2026", fallback);
  assert.strictEqual(parsedDmy.getFullYear(), 2026);
  assert.strictEqual(parsedDmy.getMonth(), 9); // October = 9
  assert.strictEqual(parsedDmy.getDate(), 7);

  const parsedInvalid = safeParseDate("not-a-date", fallback);
  assert.strictEqual(parsedInvalid.getTime(), fallback.getTime());
});

test("createCommitDateList strictly respects end date cutoff (e.g. 07-10-2026)", () => {
  const dates = createCommitDateList({
    startDate: "2024-01-01",
    endDate: "07-10-2026",
    commitsPerDay: "1,3",
    frequency: 100,
    distribution: "uniform"
  });

  const cutoff = safeParseDate("07-10-2026");
  cutoff.setHours(23, 59, 59, 999);

  for (const d of dates) {
    assert.ok(
      d.getTime() <= cutoff.getTime(),
      `Commit date ${d.toISOString()} must not exceed cutoff date ${cutoff.toISOString()}`
    );
  }
});

test("createCommitDateList generates dates within boundaries", () => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2024, 0, 10);
  const dates = createCommitDateList({
    startDate: start,
    endDate: end,
    commitsPerDay: "1,2",
    frequency: 100,
    distribution: "uniform"
  });

  assert.ok(dates.length >= 10, "Should generate at least 1 commit per day");
  for (const d of dates) {
    assert.strictEqual(d.getFullYear(), 2024);
    assert.strictEqual(d.getMonth(), 0);
    assert.ok(
      d.getDate() >= 1 && d.getDate() <= 10,
      "Day should be between 1 and 10"
    );
    assert.ok(d.getHours() >= 0 && d.getHours() <= 23);
    assert.ok(d.getMinutes() >= 0 && d.getMinutes() <= 59);
    assert.ok(d.getSeconds() >= 0 && d.getSeconds() <= 59);
  }
});

test("createCommitDateList handles reversed start and end dates gracefully", () => {
  const start = new Date(2024, 5, 1);
  const end = new Date(2024, 0, 1);
  const dates = createCommitDateList({
    startDate: start,
    endDate: end,
    commitsPerDay: "1,1",
    frequency: 100
  });

  assert.ok(
    dates.length > 0,
    "Should normalize reversed dates and produce commits"
  );
});

test("createCommitDateList with 0% frequency yields 0 commits", () => {
  const dates = createCommitDateList({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    frequency: 0
  });
  assert.strictEqual(dates.length, 0);
});

test("createCommitDateList efficiently handles 10-year range", () => {
  const startTime = Date.now();
  const dates = createCommitDateList({
    startDate: "2017-01-01",
    endDate: "2026-12-31",
    commitsPerDay: "0,2",
    frequency: 50,
    distribution: "sporadic"
  });
  const elapsed = Date.now() - startTime;

  assert.ok(
    elapsed < 1000,
    `10-year date generation should take < 1000ms, took ${elapsed}ms`
  );
  assert.ok(
    dates.length > 500,
    "Should produce realistic commit count across 10 years"
  );
});

test("All distribution modes execute without error", () => {
  const distributions = [
    "uniform",
    "workHours",
    "afterWork",
    "consistent",
    "sporadic",
    "learning",
    "project-based",
    "random",
    "human",
    "organic"
  ];

  for (const dist of distributions) {
    const dates = createCommitDateList({
      startDate: "2024-01-01",
      endDate: "2024-01-14",
      commitsPerDay: "1,3",
      frequency: 100,
      distribution: dist
    });
    assert.ok(Array.isArray(dates), `Distribution ${dist} should return array`);
    assert.ok(dates.length > 0, `Distribution ${dist} should generate commits`);
  }
});

test("getHourForDistribution respects hour bounds", () => {
  for (let i = 0; i < 50; i++) {
    const hWork = getHourForDistribution("workHours");
    const hAfter = getHourForDistribution("afterWork");
    const hUniform = getHourForDistribution("uniform");

    assert.ok(hWork >= 0 && hWork <= 23);
    assert.ok(hAfter >= 0 && hAfter <= 23);
    assert.ok(hUniform >= 0 && hUniform <= 23);
  }
});
