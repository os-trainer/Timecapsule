const { execFile } = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");

const execFileAsync = util.promisify(execFile);

/**
 * Execute a git command safely using argument arrays to prevent shell injection.
 * @param {Array<string>} args
 * @param {Object} options
 * @param {string} options.cwd
 * @param {Object} [options.env]
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
async function runGit(args, { cwd, env = {} } = {}) {
  const mergedEnv = Object.assign({}, process.env, env);
  return execFileAsync("git", args, {
    cwd,
    env: mergedEnv,
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024
  });
}

/**
 * Initialize a git repository in target directory with safe fallbacks.
 * @param {string} targetDir
 */
async function initializeGitRepository(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Initialize git repo
  await runGit(["init"], { cwd: targetDir });

  // Ensure default branch is main or master
  try {
    await runGit(["config", "init.defaultBranch", "main"], { cwd: targetDir });
  } catch (_) {}

  try {
    const { stdout: globalName } = await runGit([
      "config",
      "--global",
      "user.name"
    ]);
    if (globalName.trim()) {
      await runGit(["config", "user.name", globalName.trim()], {
        cwd: targetDir
      });
    }
  } catch (_) {
    await runGit(["config", "user.name", "os-trainer"], { cwd: targetDir });
  }

  try {
    const { stdout: globalEmail } = await runGit([
      "config",
      "--global",
      "user.email"
    ]);
    if (globalEmail.trim()) {
      await runGit(["config", "user.email", globalEmail.trim()], {
        cwd: targetDir
      });
    }
  } catch (_) {
    await runGit(["config", "user.email", "mr.raguelsimon@gmail.com"], {
      cwd: targetDir
    });
  }
}

/**
 * Stage all files and create a commit with specific date and message.
 * @param {string} targetDir
 * @param {Date} date
 * @param {string} message
 */
async function createCommit(targetDir, date, message) {
  const dateIso =
    date instanceof Date ? date.toISOString() : new Date(date).toISOString();

  const env = {
    GIT_AUTHOR_DATE: dateIso,
    GIT_COMMITTER_DATE: dateIso
  };

  await runGit(["add", "-u"], { cwd: targetDir });
  await runGit(
    [
      "commit",
      "--quiet",
      "--no-verify",
      "--allow-empty",
      "--allow-empty-message",
      "--date",
      dateIso,
      "-m",
      message
    ],
    {
      cwd: targetDir,
      env
    }
  );
}

/**
 * Safely clean and prepare a target repository directory using native Node fs.
 * @param {string} targetDir
 */
function prepareDirectory(targetDir) {
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });
}

module.exports = {
  runGit,
  initializeGitRepository,
  createCommit,
  prepareDirectory
};

