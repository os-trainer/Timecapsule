#!/usr/bin/env node

const timecapsule = require("./index");

(async function main() {
  const meow = (await import("meow")).default;

  const cli = meow(
    `
    Usage
      $ timecapsule [options]

    Options
      --commitsPerDay, -c   Customize the number of commits per day (default: "0,4").
      --frequency, -f       Chance (0-100%) of generating commits for a day (default: 80).
      --startDate, -s       Start date in yyyy/MM/dd or yyyy-MM-dd format.
      --endDate, -e         End date in yyyy/MM/dd or yyyy-MM-dd format.
      --distribution, -d    Activity distribution pattern:
                            - human: Natural human developer cadence (0-8 commits, weekend rest, burst sprints)
                            - uniform (default): Evenly distributed random commits
                            - workHours: More commits during 9am-5pm and on weekdays
                            - afterWork: More commits during evenings and weekends
                            - consistent: Moderately regular daily activity
                            - sporadic: Bursts of activity separated by quiet gaps
                            - learning: Activity ramps up from sparse to frequent
                            - project-based: Multi-week project sprints with intervals
                            - random: Pure randomized variability
      --preview, -p         Preview the activity graph without creating commits.
      --template, -t        Project template to generate (default: "javascript"):
                            - javascript: Node.js library with package.json, tests, utils
                            - python: Python package with requirements.txt, tests, utils
                            - cpp: C++ / CMake project with CMakeLists.txt, tests
                            - generic: Language-agnostic shell and config files
      --conventional        Format commit messages using Conventional Commits (feat:, fix:, etc.).
      --folder, -o          Target directory name for generated git repository (default: "my-history").

    Examples
      $ timecapsule --preview
      $ timecapsule --commitsPerDay "1,3" --frequency 75
      $ timecapsule --startDate 2024-01-01 --endDate 2024-12-31
      $ timecapsule --startDate 2017-01-01 --endDate 2026-10-07 --distribution human --commitsPerDay "0,8"
      $ timecapsule --distribution workHours --conventional
      $ timecapsule --template python --folder my-repo
      $ timecapsule --distribution learning --preview
  `,
    {
      importMeta: { url: "file://" + __filename },
      flags: {
        startDate: {
          type: "string",
          shortFlag: "s"
        },
        endDate: {
          type: "string",
          shortFlag: "e"
        },
        commitsPerDay: {
          type: "string",
          shortFlag: "c",
          default: "0,4"
        },
        frequency: {
          type: "number",
          shortFlag: "f",
          default: 80
        },
        distribution: {
          type: "string",
          shortFlag: "d",
          default: "uniform"
        },
        preview: {
          type: "boolean",
          shortFlag: "p",
          default: false
        },
        template: {
          type: "string",
          shortFlag: "t",
          default: "javascript"
        },
        conventional: {
          type: "boolean",
          default: false
        },
        folder: {
          type: "string",
          shortFlag: "o",
          default: "my-history"
        }
      }
    }
  );

  try {
    await timecapsule(cli.flags);
  } catch (err) {
    console.error("\nError:", err.message);
    process.exit(1);
  }
})();
