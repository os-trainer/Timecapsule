const fs = require("fs");
const path = require("path");
const { addYears } = require("date-fns");
const chalk = require("chalk");
const ora = require("ora");

const { safeParseDate, createCommitDateList } = require("./dates");
const { MessageGenerator } = require("./messages");
const { FileMutator } = require("./templates");
const {
  initializeGitRepository,
  createCommit,
  prepareDirectory,
  runGit
} = require("./git");
const generateActivityVisualization = require("./visualization");

/**
 * Main generator entry point.
 */
module.exports = async function({
  commitsPerDay = "0,4",
  frequency = 70,
  startDate,
  endDate,
  distribution = "uniform",
  preview = false,
  template = "javascript",
  conventional = false,
  folder = "my-history",
  outputFolder
} = {}) {
  const targetFolder = outputFolder || folder || "my-history";

  // Parse start and end dates with robust fallbacks
  const defaultStart = addYears(new Date(), -1);
  const defaultEnd = new Date();
  const startDateObj = safeParseDate(startDate, defaultStart);
  const endDateObj = safeParseDate(endDate, defaultEnd);

  // Generate date list
  const commitDateList = createCommitDateList({
    commitsPerDay,
    frequency,
    startDate: startDateObj,
    endDate: endDateObj,
    distribution: distribution || "uniform"
  });

  // If preview mode is requested, print graph and return
  if (preview) {
    const vizOutput = generateActivityVisualization(
      commitDateList,
      startDateObj,
      endDateObj,
      { distribution, preview: true }
    );
    console.log(vizOutput);
    return {
      preview: true,
      totalCommits: commitDateList.length,
      startDate: startDateObj,
      endDate: endDateObj,
      distribution
    };
  }

  const spinner = ora("Generating your GitHub activity...\n").start();
  const isCurrentRepo =
    targetFolder === "." ||
    targetFolder === "current" ||
    targetFolder.toLowerCase() === path.basename(process.cwd()).toLowerCase() ||
    path.resolve(process.cwd(), targetFolder) === process.cwd();

  const resolvedTargetDir = isCurrentRepo
    ? process.cwd()
    : path.resolve(process.cwd(), targetFolder);

  try {
    if (!isCurrentRepo) {
      // Clean and initialize destination folder for subfolder targets
      prepareDirectory(resolvedTargetDir);
      await initializeGitRepository(resolvedTargetDir);
    } else {
      // Verify git repository configuration for current folder
      await initializeGitRepository(resolvedTargetDir);
    }

    // Initialize message generator
    const messageGen = new MessageGenerator({ conventional });
    const totalCommits = commitDateList.length;

    // Pristine snapshots of repository files for realistic evolutionary distribution
    const pristineFiles = {};
    const repoMilestones = [
      {
        path: ".github/ISSUE_TEMPLATE/bug_report.md",
        ratio: 0.88, // ~2025 (~1 year ago)
        msg: "ci: update issue templates and community health files"
      },
      {
        path: ".gitignore",
        ratio: 0.93, // ~May 2026 (~4-5 months ago)
        msg: "chore: update gitignore rules for local development"
      },
      {
        path: "docs/api.md",
        ratio: 0.96, // ~Jul/Aug 2026 (~2-3 months ago)
        msg: "docs: update API parameter reference and examples"
      },
      {
        path: "package.json",
        companion: "package-lock.json",
        ratio: 0.975, // ~Sep 2026 (~1 month ago)
        msg: "chore: bump dependencies and version to 2.0.0"
      },
      {
        path: "README.md",
        ratio: 0.985, // ~late Sep 2026 (~2-3 weeks ago)
        msg: "docs: update configuration options and distribution examples"
      },
      {
        path: "tests/dates.test.js",
        ratio: 0.993, // ~Oct 1-2, 2026 (~5-6 days ago)
        msg: "test: add boundary test cases for date parsing and distribution"
      },
      {
        path: "src/dates.js",
        ratio: 0.997, // ~Oct 5, 2026 (~2 days ago)
        msg: "refactor: optimize distribution sampling and activity calculations"
      },
      {
        path: "src/cli.js",
        ratio: 0.999, // ~Oct 6, 2026 (~1 day ago)
        msg: "fix: improve git execution safety and in-place options"
      }
    ];

    if (isCurrentRepo) {
      for (const m of repoMilestones) {
        const full = path.join(resolvedTargetDir, m.path);
        if (fs.existsSync(full)) {
          pristineFiles[m.path] = fs.readFileSync(full, "utf8");
        }
        if (m.companion) {
          const compFull = path.join(resolvedTargetDir, m.companion);
          if (fs.existsSync(compFull)) {
            pristineFiles[m.companion] = fs.readFileSync(compFull, "utf8");
          }
        }
      }
    }

    // For current repository, backdate the initial commit to the start date (commitDateList[0])
    if (isCurrentRepo && totalCommits > 0) {
      const initialDate = commitDateList[0];
      const initialIso =
        initialDate instanceof Date
          ? initialDate.toISOString()
          : new Date(initialDate).toISOString();
      try {
        await runGit(["add", "-u"], { cwd: resolvedTargetDir });
        await runGit(
          ["commit", "--amend", "--no-edit", "--no-verify", "--date", initialIso],
          {
            cwd: resolvedTargetDir,
            env: {
              GIT_COMMITTER_DATE: initialIso,
              GIT_AUTHOR_DATE: initialIso
            }
          }
        );
      } catch (_) {}
    }

    const startIndex = isCurrentRepo ? 1 : 0;

    for (let i = startIndex; i < totalCommits; i++) {
      const commitDate = commitDateList[i];
      const progressRatio = totalCommits > 1 ? i / (totalCommits - 1) : 0;

      // Select categorized message
      const commitInfo = messageGen.nextCommit({ progressRatio });
      let commitMessage = commitInfo.message;

      if (isCurrentRepo) {
        // Check if any milestone file is scheduled for its FINAL pristine commit at this index
        const milestone = repoMilestones.find(
          m => Math.floor(totalCommits * m.ratio) === i
        );

        if (milestone) {
          // Restore this file to its EXACT pristine state and stage it
          const targetPath = path.join(resolvedTargetDir, milestone.path);
          if (pristineFiles[milestone.path]) {
            fs.writeFileSync(targetPath, pristineFiles[milestone.path], "utf8");
          }
          if (milestone.companion && pristineFiles[milestone.companion]) {
            fs.writeFileSync(
              path.join(resolvedTargetDir, milestone.companion),
              pristineFiles[milestone.companion],
              "utf8"
            );
          }
          commitMessage = milestone.msg;
        } else {
          // Touch files occasionally prior to their final milestone to create deep multi-year history
          if (commitInfo.category === "docs" && i % 18 === 0 && progressRatio < 0.985) {
            const readmePath = path.join(resolvedTargetDir, "README.md");
            if (fs.existsSync(readmePath)) {
              let c = fs.readFileSync(readmePath, "utf8");
              if (!c.endsWith("\n\n")) c += "\n";
              else c = c.slice(0, -1);
              fs.writeFileSync(readmePath, c, "utf8");
            }
          } else if (commitInfo.category === "testing" && i % 15 === 0 && progressRatio < 0.993) {
            const testPath = path.join(resolvedTargetDir, "tests/dates.test.js");
            if (fs.existsSync(testPath)) {
              let c = fs.readFileSync(testPath, "utf8");
              if (!c.endsWith("\n\n")) c += "\n";
              else c = c.slice(0, -1);
              fs.writeFileSync(testPath, c, "utf8");
            }
          } else if (
            (commitInfo.category === "features" ||
              commitInfo.category === "refactor" ||
              commitInfo.category === "fixes") &&
            i % 12 === 0 &&
            progressRatio < 0.997
          ) {
            const srcPath = path.join(resolvedTargetDir, "src/dates.js");
            if (fs.existsSync(srcPath)) {
              let c = fs.readFileSync(srcPath, "utf8");
              if (!c.endsWith("\n\n")) c += "\n";
              else c = c.slice(0, -1);
              fs.writeFileSync(srcPath, c, "utf8");
            }
          }

          // In all other cases, update CHANGELOG.md cleanly
          FileMutator.mutateDocumentation(
            resolvedTargetDir,
            "javascript",
            commitInfo.rawMessage,
            i
          );
        }
      } else {
        FileMutator.applyMutation(
          resolvedTargetDir,
          template,
          commitInfo,
          commitDate
        );
      }

      // Create commit with specific author & committer date
      await createCommit(resolvedTargetDir, commitDate, commitMessage);

      // Update spinner feedback every few commits or on significant intervals
      if (i % 5 === 0 || i === totalCommits - 1) {
        const dateFormatted = new Intl.DateTimeFormat("en", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }).format(commitDate);
        spinner.text = `Generating commits (${i +
          1}/${totalCommits}): ${dateFormatted} - "${commitMessage.slice(
          0,
          35
        )}..."`;
      }
    }

    // Ensure 100% of tracked files match their pristine content at completion
    if (isCurrentRepo) {
      for (const [relPath, content] of Object.entries(pristineFiles)) {
        const full = path.join(resolvedTargetDir, relPath);
        fs.writeFileSync(full, content, "utf8");
      }
    }

    const displayFolder = isCurrentRepo
      ? path.basename(process.cwd())
      : targetFolder;
    spinner.succeed(
      `Successfully generated ${totalCommits} commits in ${displayFolder}`
    );

    // Clean next steps instruction without calendar or coffee box
    if (isCurrentRepo) {
      console.log(chalk.cyan(`\nNext steps:\n  git push --force -u origin main\n`));
    } else {
      console.log(
        chalk.cyan(
          `\nNext steps:\n  cd ${targetFolder}\n  git remote add origin <YOUR_GITHUB_REPO_URL>\n  git branch -M main\n  git push -u origin main\n`
        )
      );
    }

    return {
      success: true,
      folder: targetFolder,
      totalCommits,
      startDate: startDateObj,
      endDate: endDateObj,
      template,
      distribution
    };
  } catch (err) {
    spinner.fail(`Failed to generate activity: ${err.message}`);
    throw err;
  }
};
