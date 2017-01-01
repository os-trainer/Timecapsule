const fs = require("fs");
const path = require("path");
const { TEMPLATES } = require("./definitions");

/**
 * FileMutator applies incremental, realistic code and documentation changes
 * to synthetic project files corresponding to each commit message.
 */
class FileMutator {
  /**
   * Initialize or verify template files in the target directory.
   * @param {string} rootDir
   * @param {string} [templateName="javascript"]
   */
  static initializeRepository(rootDir, templateName = "javascript") {
    const template = TEMPLATES[templateName] || TEMPLATES.javascript;

    for (const [relPath, content] of Object.entries(template.files)) {
      const fullPath = path.join(rootDir, relPath);
      const dirName = path.dirname(fullPath);

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      fs.writeFileSync(fullPath, content, "utf8");
    }
  }

  /**
   * Apply an incremental change to repository files based on commit category and message.
   * @param {string} rootDir
   * @param {string} templateName
   * @param {Object} commitInfo
   * @param {string} commitInfo.category
   * @param {string} commitInfo.message
   * @param {string} commitInfo.rawMessage
   * @param {number} commitInfo.commitIndex
   * @param {Date} [commitDate]
   */
  static applyMutation(
    rootDir,
    templateName,
    commitInfo,
    commitDate = new Date()
  ) {
    const template = TEMPLATES[templateName] || TEMPLATES.javascript;
    const { category, rawMessage, commitIndex } = commitInfo;

    // First commit initializes the project structure
    if (commitIndex === 0) {
      FileMutator.initializeRepository(rootDir, template.name);
      return;
    }

    switch (category) {
      case "docs":
        FileMutator.mutateDocumentation(
          rootDir,
          template.name,
          rawMessage,
          commitIndex
        );
        break;

      case "testing":
        FileMutator.mutateTests(
          rootDir,
          template.name,
          rawMessage,
          commitIndex
        );
        break;

      case "features":
        FileMutator.mutateFeatures(
          rootDir,
          template.name,
          rawMessage,
          commitIndex
        );
        break;

      case "fixes":
        FileMutator.mutateFixes(
          rootDir,
          template.name,
          rawMessage,
          commitIndex
        );
        break;

      case "refactor":
        FileMutator.mutateRefactor(
          rootDir,
          template.name,
          rawMessage,
          commitIndex
        );
        break;

      case "config":
        FileMutator.mutateConfig(
          rootDir,
          template.name,
          rawMessage,
          commitIndex
        );
        break;

      case "quality":
        FileMutator.mutateQuality(
          rootDir,
          template.name,
          rawMessage,
          commitIndex
        );
        break;

      case "setup":
      default:
        FileMutator.mutateSetup(
          rootDir,
          template.name,
          rawMessage,
          commitIndex
        );
        break;
    }
  }

  /**
   * Mutate README or docs files
   */
  static mutateDocumentation(rootDir, templateName, rawMessage, commitIndex) {
    // Keep README.md clean and professional without machine-generated update spam.
    // Instead, update CHANGELOG.md under meaningful release entries.
    const changelogPath = path.join(rootDir, "CHANGELOG.md");
    if (!fs.existsSync(changelogPath)) {
      const initialChangelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - Initial Release
### Added
- Core modular utilities and configuration loader.
- Base test harness and verification suite.
`;
      fs.writeFileSync(changelogPath, initialChangelog, "utf8");
      return;
    }

    let content = fs.readFileSync(changelogPath, "utf8");
    const major = 1 + Math.floor(commitIndex / 1000);
    const minor = Math.floor((commitIndex % 1000) / 100);
    const releaseHeader = `## [${major}.${minor}.0]`;

    const cleanedMsg = rawMessage.replace(
      /^(Add|Implement|Fix|Update|Refactor|Improve)\s+/i,
      ""
    );
    const entry = `- ${rawMessage}`;

    if (!content.includes(releaseHeader)) {
      content += `\n${releaseHeader}\n### Changed\n${entry}\n`;
    } else {
      content += `${entry}\n`;
    }

    fs.writeFileSync(changelogPath, content, "utf8");
  }

  /**
   * Mutate unit tests
   */
  static mutateTests(rootDir, templateName, rawMessage, commitIndex) {
    let testFile;
    if (templateName === "javascript") testFile = "tests/utils.test.js";
    else if (templateName === "python") testFile = "tests/test_utils.py";
    else if (templateName === "cpp") testFile = "tests/test_main.cpp";
    else testFile = "tests/run_tests.sh";

    const testPath = path.join(rootDir, testFile);
    if (!fs.existsSync(testPath)) return;

    let content = fs.readFileSync(testPath, "utf8");

    if (templateName === "javascript") {
      const testSnippet = `\n// Test iteration ${commitIndex}: ${rawMessage}\nassert.strictEqual(typeof validateInput, "function", "validateInput should remain callable");\n`;
      content += testSnippet;
    } else if (templateName === "python") {
      const testSnippet = `\n# Test iteration ${commitIndex}: ${rawMessage}\ndef test_case_${commitIndex}():\n    assert validate_input("valid_token_${commitIndex}") is True\n`;
      content += testSnippet;
    } else if (templateName === "cpp") {
      const testSnippet = `\n// Test iteration ${commitIndex}: ${rawMessage}\n// assert(demo::validate_input("token_${commitIndex}"));\n`;
      content += testSnippet;
    } else {
      content += `\n# Check ${commitIndex}: ${rawMessage}\necho "Verified check ${commitIndex}"\n`;
    }

    fs.writeFileSync(testPath, content, "utf8");
  }

  /**
   * Mutate features in source files
   */
  static mutateFeatures(rootDir, templateName, rawMessage, commitIndex) {
    let srcFile;
    if (templateName === "javascript") srcFile = "src/utils.js";
    else if (templateName === "python") srcFile = "src/utils.py";
    else if (templateName === "cpp") srcFile = "src/utils.cpp";
    else srcFile = "src/helpers.sh";

    const srcPath = path.join(rootDir, srcFile);
    if (!fs.existsSync(srcPath)) return;

    let content = fs.readFileSync(srcPath, "utf8");

    if (templateName === "javascript") {
      const funcName = `helperStep${commitIndex}`;
      const featureCode = `\n/** Feature iteration: ${rawMessage} */\nfunction ${funcName}(val) {\n  return val !== null && val !== undefined;\n}\nmodule.exports.${funcName} = ${funcName};\n`;
      content += featureCode;
    } else if (templateName === "python") {
      const funcName = `helper_step_${commitIndex}`;
      const featureCode = `\n# Feature iteration: ${rawMessage}\ndef ${funcName}(val):\n    return val is not None\n`;
      content += featureCode;
    } else if (templateName === "cpp") {
      content += `\n// Feature iteration: ${rawMessage}\n// Step ${commitIndex} helper initialized\n`;
    } else {
      content += `\n# Feature: ${rawMessage}\nhelper_metric_${commitIndex}() {\n  echo "metric_${commitIndex}"\n}\n`;
    }

    fs.writeFileSync(srcPath, content, "utf8");
  }

  /**
   * Mutate bug fixes
   */
  static mutateFixes(rootDir, templateName, rawMessage, commitIndex) {
    let srcFile;
    if (templateName === "javascript") srcFile = "src/utils.js";
    else if (templateName === "python") srcFile = "src/utils.py";
    else if (templateName === "cpp") srcFile = "src/utils.cpp";
    else srcFile = "src/helpers.sh";

    const srcPath = path.join(rootDir, srcFile);
    if (!fs.existsSync(srcPath)) return;

    let content = fs.readFileSync(srcPath, "utf8");
    const guardComment = `\n// Guard fix (${commitIndex}): ${rawMessage}\n`;

    if (templateName === "javascript" || templateName === "cpp") {
      content += guardComment;
    } else if (templateName === "python") {
      content += `\n# Guard fix (${commitIndex}): ${rawMessage}\n`;
    } else {
      content += `\n# Fix guard (${commitIndex}): ${rawMessage}\n`;
    }

    fs.writeFileSync(srcPath, content, "utf8");
  }

  /**
   * Mutate refactoring
   */
  static mutateRefactor(rootDir, templateName, rawMessage, commitIndex) {
    let srcFile;
    if (templateName === "javascript") srcFile = "src/config.js";
    else if (templateName === "python") srcFile = "src/config.py";
    else if (templateName === "cpp") srcFile = "src/utils.cpp";
    else srcFile = "src/app.sh";

    const srcPath = path.join(rootDir, srcFile);
    if (!fs.existsSync(srcPath)) return;

    let content = fs.readFileSync(srcPath, "utf8");
    const refactorComment = `\n// Refactor step (${commitIndex}): ${rawMessage}\n`;

    if (templateName === "javascript" || templateName === "cpp") {
      content += refactorComment;
    } else {
      content += `\n# Refactor step (${commitIndex}): ${rawMessage}\n`;
    }

    fs.writeFileSync(srcPath, content, "utf8");
  }

  /**
   * Mutate configuration / package files
   */
  static mutateConfig(rootDir, templateName, rawMessage, commitIndex) {
    if (templateName === "javascript") {
      const pkgPath = path.join(rootDir, "package.json");
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
          const major = 1 + Math.floor(commitIndex / 1000);
          const minor = Math.floor((commitIndex % 1000) / 100);
          const patch = Math.floor((commitIndex % 100) / 10);
          pkg.version = `${major}.${minor}.${patch}`;
          fs.writeFileSync(
            pkgPath,
            JSON.stringify(pkg, null, 2) + "\n",
            "utf8"
          );
        } catch (_) {}
      }
    } else if (templateName === "python") {
      const reqPath = path.join(rootDir, "requirements.txt");
      if (fs.existsSync(reqPath)) {
        let content = fs.readFileSync(reqPath, "utf8");
        content += `# Updated for step ${commitIndex}: ${rawMessage}\n`;
        fs.writeFileSync(reqPath, content, "utf8");
      }
    } else if (templateName === "generic") {
      const cfgPath = path.join(rootDir, "config.json");
      if (fs.existsSync(cfgPath)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
          const major = 1 + Math.floor(commitIndex / 1000);
          const minor = Math.floor((commitIndex % 1000) / 100);
          const patch = Math.floor((commitIndex % 100) / 10);
          cfg.version = `${major}.${minor}.${patch}`;
          fs.writeFileSync(
            cfgPath,
            JSON.stringify(cfg, null, 2) + "\n",
            "utf8"
          );
        } catch (_) {}
      }
    }
  }

  /**
   * Mutate code quality / cleanup
   */
  static mutateQuality(rootDir, templateName, rawMessage, commitIndex) {
    const targetFile =
      templateName === "javascript"
        ? path.join(rootDir, "src", "index.js")
        : path.join(rootDir, "README.md");

    if (fs.existsSync(targetFile)) {
      let content = fs.readFileSync(targetFile, "utf8");
      content += `\n// Code quality (${commitIndex}): ${rawMessage}\n`;
      fs.writeFileSync(targetFile, content, "utf8");
    }
  }

  /**
   * Mutate setup / tooling
   */
  static mutateSetup(rootDir, templateName, rawMessage, commitIndex) {
    const gitignorePath = path.join(rootDir, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
      let content = fs.readFileSync(gitignorePath, "utf8");
      const entry = `\n# Setup update ${commitIndex}: ${rawMessage}\n`;
      if (!content.includes(entry)) {
        content += entry;
        fs.writeFileSync(gitignorePath, content, "utf8");
      }
    }
  }
}

module.exports = {
  FileMutator
};
