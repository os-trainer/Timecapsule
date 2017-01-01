const test = require("node:test");
const assert = require("node:assert");
const {
  MESSAGE_CATALOG,
  MessageGenerator,
  CONVENTIONAL_PREFIXES
} = require("../src/messages");

test("MESSAGE_CATALOG contains at least 250-300 unique messages across 8 categories", () => {
  const expectedCategories = [
    "setup",
    "features",
    "fixes",
    "refactor",
    "testing",
    "docs",
    "config",
    "quality"
  ];

  const allMessages = new Set();
  let totalCount = 0;

  for (const cat of expectedCategories) {
    assert.ok(
      Array.isArray(MESSAGE_CATALOG[cat]),
      `Category ${cat} must be an array`
    );
    assert.ok(
      MESSAGE_CATALOG[cat].length >= 30,
      `Category ${cat} should have at least 30 messages`
    );

    for (const msg of MESSAGE_CATALOG[cat]) {
      assert.strictEqual(typeof msg, "string");
      assert.ok(msg.length > 5, "Message should be meaningful");
      // Verify no banned unrealistic messages
      assert.notStrictEqual(msg.toLowerCase(), "fake commit");
      assert.notStrictEqual(msg.toLowerCase(), "asdf");
      assert.notStrictEqual(msg.toLowerCase(), "test");
      assert.notStrictEqual(msg.toLowerCase(), "update");
      allMessages.add(msg);
      totalCount++;
    }
  }

  assert.ok(
    allMessages.size >= 250,
    `Catalog should contain at least 250 unique messages, found ${allMessages.size}`
  );
});

test("MessageGenerator produces varied commits and avoids immediate duplicates", () => {
  const gen = new MessageGenerator({ cooldownSize: 30 });
  const generated = [];

  for (let i = 0; i < 50; i++) {
    const commit = gen.nextCommit({ progressRatio: i / 50 });
    assert.ok(commit.message, "Commit must have message");
    assert.ok(commit.category, "Commit must have category");

    // Check that message is not identical to immediately preceding message
    if (generated.length > 0) {
      const prev = generated[generated.length - 1];
      assert.notStrictEqual(
        commit.rawMessage,
        prev.rawMessage,
        "Should not repeat the immediate preceding commit message"
      );
    }

    generated.push(commit);
  }

  // Verify diversity of categories across 50 commits
  const categoriesUsed = new Set(generated.map(c => c.category));
  assert.ok(
    categoriesUsed.size >= 5,
    `Should use at least 5 different categories across 50 commits, found ${categoriesUsed.size}`
  );
});

test("MessageGenerator supports Conventional Commits format", () => {
  const gen = new MessageGenerator({ conventional: true });
  const validPrefixes = new Set([
    "feat:",
    "fix:",
    "docs:",
    "test:",
    "refactor:",
    "chore:",
    "style:"
  ]);

  for (let i = 0; i < 20; i++) {
    const commit = gen.nextCommit({ progressRatio: i / 20 });
    const firstWord = commit.message.split(" ")[0];
    assert.ok(
      validPrefixes.has(firstWord),
      `Expected prefix like 'feat:' or 'fix:', got '${firstWord}' in '${commit.message}'`
    );
  }
});

test("First commit is in setup category for realistic project progression", () => {
  const gen = new MessageGenerator();
  const first = gen.nextCommit({ progressRatio: 0 });
  assert.strictEqual(first.category, "setup");
});
