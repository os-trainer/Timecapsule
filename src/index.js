const path = require("path");
const { addYears } = require("date-fns");
const chalk = require("chalk");
const ora = require("ora");
const boxen = require("boxen");

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
 *
 * @param {Object} options
 * @param {string} [options.commitsPerDay="0,4"] - Customize commits per day range (e.g. "0,3")
 * @param {number} [options.frequency=80] - Chance (0-100%) of generating commits on any day
 * @param {string|Date} [options.startDate] - Start date (yyyy/MM/dd, yyyy-MM-dd, ISO)
 * @param {string|Date} [options.endDate] - End date (yyyy/MM/dd, yyyy-MM-dd, ISO)
 * @param {string} [options.distribution="uniform"] - Activity pattern: uniform, workHours, afterWork, consistent, sporadic, learning, project-based, random
 * @param {boolean} [options.preview=false] - Preview activity graph without writing commits
 * @param {string} [options.template="javascript"] - Project template: javascript, python, cpp, generic
 * @param {boolean} [options.conventional=false] - Format messages using Conventional Commits standard
 * @param {string} [options.folder="my-history"] - Destination directory for synthetic repository
 * @returns {Promise<Object>} Execution result statistics
 */
module.exports = async function({
  commitsPerDay = "0,4",
  frequency = 80,
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

    // For current repository, backdate the initial commit to the start date (commitDateList[0])
    if (isCurrentRepo && totalCommits > 0) {
      const initialDate = commitDateList[0];
      const initialIso =
        initialDate instanceof Date
          ? initialDate.toISOString()
          : new Date(initialDate).toISOString();
      try {
        await runGit(["add", "."], { cwd: resolvedTargetDir });
        await runGit(["commit", "--amend", "--no-edit", "--date", initialIso], {
          cwd: resolvedTargetDir,
          env: {
            GIT_COMMITTER_DATE: initialIso,
            GIT_AUTHOR_DATE: initialIso
          }
        });
      } catch (_) {}
    }

    const startIndex = isCurrentRepo ? 1 : 0;

    for (let i = startIndex; i < totalCommits; i++) {
      const commitDate = commitDateList[i];
      const progressRatio = totalCommits > 1 ? i / (totalCommits - 1) : 0;

      // Select categorized message
      const commitInfo = messageGen.nextCommit({ progressRatio });

      if (isCurrentRepo) {
        // In current repo, mutate CHANGELOG cleanly to preserve core project source code
        FileMutator.mutateDocumentation(
          resolvedTargetDir,
          "javascript",
          commitInfo.rawMessage,
          i
        );
      } else {
        FileMutator.applyMutation(
          resolvedTargetDir,
          template,
          commitInfo,
          commitDate
        );
      }

      // Create commit with specific author & committer date
      await createCommit(resolvedTargetDir, commitDate, commitInfo.message);

      // Update spinner feedback every few commits or on significant intervals
      if (i % 5 === 0 || i === totalCommits - 1) {
        const dateFormatted = new Intl.DateTimeFormat("en", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }).format(commitDate);
        spinner.text = `Generating commits (${i +
          1}/${totalCommits}): ${dateFormatted} - "${commitInfo.message.slice(
          0,
          35
        )}..."`;
      }
    }

    const displayFolder = isCurrentRepo
      ? path.basename(process.cwd())
      : targetFolder;
    spinner.succeed(
      `Successfully generated ${totalCommits} commits in ${displayFolder}`
    );

    // Print activity graph
    console.log(chalk.bold("\nActivity Graph:\n"));
    console.log(
      generateActivityVisualization(commitDateList, startDateObj, endDateObj, {
        distribution,
        preview: false
      })
    );

    // Instructions on pushing to GitHub
    if (isCurrentRepo) {
      console.log(chalk.cyan(`\nNext steps:\n  git push -u origin main\n`));
    } else {
      console.log(
        chalk.cyan(
          `\nNext steps:\n  cd ${targetFolder}\n  git remote add origin <YOUR_GITHUB_REPO_URL>\n  git branch -M main\n  git push -u origin main\n`
        )
      );
    }

    // Coffee support boxen (preserving original attribution)
    console.log(
      boxen(
        `${chalk.yellow.bold(
          "If you rely on this tool, please consider buying me a cup of coffee, "
        )}\n` +
          `${chalk.yellow.bold("I would appreciate it!")}\n\n` +
          `${chalk.blueBright.bold("https://www.buymeacoffee.com/artiebits")}`,
        {
          borderColor: "yellow",
          padding: 1,
          align: "center",
          borderStyle: "double",
          margin: 1
        }
      )
    );

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
