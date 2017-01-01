const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { TEMPLATES, FileMutator } = require("../src/templates");

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "fgh-test-"));
}

test("All templates contain required base files", () => {
  const expectedTemplates = ["javascript", "python", "cpp", "generic"];

  for (const tName of expectedTemplates) {
    const template = TEMPLATES[tName];
    assert.ok(template, `Template ${tName} must exist`);
    assert.ok(
      template.files["README.md"],
      `Template ${tName} must have README.md`
    );
    assert.ok(
      template.files[".gitignore"],
      `Template ${tName} must have .gitignore`
    );
  }
});

test("FileMutator initializes and mutates javascript template files", () => {
  const tmpDir = createTempDir();

  try {
    // Step 0: Initialize
    FileMutator.applyMutation(tmpDir, "javascript", {
      category: "setup",
      message: "Initialize project structure",
      rawMessage: "Initialize project structure",
      commitIndex: 0
    });

    assert.ok(fs.existsSync(path.join(tmpDir, "package.json")));
    assert.ok(fs.existsSync(path.join(tmpDir, "README.md")));
    assert.ok(fs.existsSync(path.join(tmpDir, "src", "index.js")));
    assert.ok(fs.existsSync(path.join(tmpDir, "src", "utils.js")));
    assert.ok(fs.existsSync(path.join(tmpDir, "tests", "utils.test.js")));

    const initialReadme = fs.readFileSync(
      path.join(tmpDir, "README.md"),
      "utf8"
    );

    // Step 1: Docs mutation creates/updates CHANGELOG.md
    assert.strictEqual(fs.existsSync(path.join(tmpDir, "CHANGELOG.md")), false);
    FileMutator.applyMutation(tmpDir, "javascript", {
      category: "docs",
      message: "Improve documentation with usage examples",
      rawMessage: "Improve documentation with usage examples",
      commitIndex: 1
    });

    assert.ok(fs.existsSync(path.join(tmpDir, "CHANGELOG.md")), "CHANGELOG.md should exist after docs commit");
    const changelogContent = fs.readFileSync(path.join(tmpDir, "CHANGELOG.md"), "utf8");
    assert.ok(changelogContent.includes("Changelog"), "CHANGELOG.md should contain Changelog header");

    // Step 2: Feature mutation
    const initialUtils = fs.readFileSync(
      path.join(tmpDir, "src", "utils.js"),
      "utf8"
    );
    FileMutator.applyMutation(tmpDir, "javascript", {
      category: "features",
      message: "Add input validation helper",
      rawMessage: "Add input validation helper",
      commitIndex: 2
    });
    const updatedUtils = fs.readFileSync(
      path.join(tmpDir, "src", "utils.js"),
      "utf8"
    );
    assert.notStrictEqual(
      initialUtils,
      updatedUtils,
      "utils.js should be updated on feature commit"
    );

    // Step 3: Test mutation
    const initialTest = fs.readFileSync(
      path.join(tmpDir, "tests", "utils.test.js"),
      "utf8"
    );
    FileMutator.applyMutation(tmpDir, "javascript", {
      category: "testing",
      message: "Add unit tests for helper utilities",
      rawMessage: "Add unit tests for helper utilities",
      commitIndex: 3
    });
    const updatedTest = fs.readFileSync(
      path.join(tmpDir, "tests", "utils.test.js"),
      "utf8"
    );
    assert.notStrictEqual(
      initialTest,
      updatedTest,
      "tests file should be updated on test commit"
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("FileMutator initializes and mutates python template files", () => {
  const tmpDir = createTempDir();

  try {
    FileMutator.applyMutation(tmpDir, "python", {
      category: "setup",
      message: "Initialize repository",
      rawMessage: "Initialize repository",
      commitIndex: 0
    });

    assert.ok(fs.existsSync(path.join(tmpDir, "requirements.txt")));
    assert.ok(fs.existsSync(path.join(tmpDir, "src", "main.py")));
    assert.ok(fs.existsSync(path.join(tmpDir, "tests", "test_utils.py")));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
