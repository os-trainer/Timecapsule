#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { MessageGenerator } = require("../src/messages");

function runGit(args) {
  return execFileSync("git", args, { stdio: "inherit" });
}

function getCommitCount() {
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Human schedule: ~75% chance active on weekdays, ~40% on weekends
  const activeChance = isWeekend ? 40 : 75;
  const isActive = Math.random() * 100 <= activeChance;

  if (!isActive) {
    return 0;
  }

  // Distribution: weighted between 1 and 8
  const roll = Math.random();
  if (roll < 0.35) {
    // Light activity: 1-2 commits
    return Math.floor(Math.random() * 2) + 1;
  } else if (roll < 0.75) {
    // Normal day: 3-4 commits
    return Math.floor(Math.random() * 2) + 3;
  } else if (roll < 0.93) {
    // Active sprint: 5-6 commits
    return Math.floor(Math.random() * 2) + 5;
  } else {
    // Peak sprint: 7-8 commits
    return Math.floor(Math.random() * 2) + 7;
  }
}

function updateChangelog(message) {
  const changelogPath = path.resolve(__dirname, "../CHANGELOG.md");
  const today = new Date().toISOString().split("T")[0];
  const sectionHeader = `\n## [${today}]`;

  let content = fs.existsSync(changelogPath)
    ? fs.readFileSync(changelogPath, "utf8")
    : "# Changelog\n";

  if (!content.includes(sectionHeader)) {
    content += `${sectionHeader}\n### Changed\n- ${message}\n`;
  } else {
    content += `- ${message}\n`;
  }

  fs.writeFileSync(changelogPath, content, "utf8");
}

function main() {
  const count = getCommitCount();
  console.log(`[Timecapsule] Evaluated today's activity: ${count} commits scheduled.`);

  if (count === 0) {
    console.log("[Timecapsule] Rest day (0 commits). Exiting.");
    process.exit(0);
  }

  const messageGen = new MessageGenerator({ conventional: true });

  for (let i = 0; i < count; i++) {
    const commitInfo = messageGen.nextCommit();
    updateChangelog(commitInfo.rawMessage);

    runGit(["add", "CHANGELOG.md"]);
    runGit(["commit", "--no-verify", "-m", commitInfo.message]);
    console.log(`[Timecapsule] Created commit ${i + 1}/${count}: ${commitInfo.message}`);
  }

  console.log(`[Timecapsule] Successfully created all ${count} commits.`);
}

main();
