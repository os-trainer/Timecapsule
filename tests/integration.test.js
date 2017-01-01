const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const fgh = require("../src/index");

test("Programmatic execution in preview mode returns metadata without modifying disk", async () => {
  const testFolder = path.join(os.tmpdir(), "fgh-preview-test-" + Date.now());

  const result = await fgh({
    startDate: "2024-01-01",
    endDate: "2024-01-10",
    commitsPerDay: "1,2",
    frequency: 100,
    preview: true,
    folder: testFolder
  });

  assert.strictEqual(result.preview, true);
  assert.ok(result.totalCommits > 0);
  assert.strictEqual(
    fs.existsSync(testFolder),
    false,
    "Preview mode should not create folder"
  );
});

test("Generates small synthetic repository with realistic commits and file changes", async () => {
  const testDirName = "test-history-repo-" + Date.now();
  const testPath = path.resolve(process.cwd(), testDirName);

  try {
    const result = await fgh({
      startDate: "2024-01-01",
      endDate: "2024-01-03",
      commitsPerDay: "2,2",
      frequency: 100,
      folder: testDirName,
      template: "javascript",
      conventional: true
    });

    assert.strictEqual(result.success, true);
    assert.ok(fs.existsSync(testPath), "Repo directory must exist");
    assert.ok(
      fs.existsSync(path.join(testPath, ".git")),
      ".git directory must exist"
    );
    assert.ok(
      fs.existsSync(path.join(testPath, "package.json")),
      "package.json must exist"
    );
    assert.ok(
      fs.existsSync(path.join(testPath, "src", "index.js")),
      "src/index.js must exist"
    );

    // Inspect git log
    const gitLog = execFileSync(
      "git",
      ["log", "--pretty=format:%h %ad %s", "--date=short"],
      { cwd: testPath }
    ).toString();

    const logLines = gitLog.trim().split("\n");
    assert.strictEqual(logLines.length, result.totalCommits);

    // Verify messages do NOT say "fake commit"
    for (const line of logLines) {
      assert.ok(
        !line.includes("fake commit"),
        "Commit log should not have hardcoded 'fake commit'"
      );
      // Verify conventional commit format (feat:, chore:, etc.)
      assert.ok(
        /^(feat|fix|docs|test|refactor|chore|style):/i.test(line.split(" ")[2]),
        `Commit should have conventional prefix: ${line}`
      );
    }
  } finally {
    // Cleanup generated test repository
    if (fs.existsSync(testPath)) {
      fs.rmSync(testPath, { recursive: true, force: true });
    }
  }
});
