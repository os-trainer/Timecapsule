const chalk = require("chalk");
const { format, getDay, differenceInDays, addDays } = require("date-fns");

/**
 * Generate a visualization of the activity graph.
 * Handles both standard 1-year windows and multi-year (up to 10-year) date spans.
 *
 * @param {Array<Date>} commitDateList - List of commit dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Object} [options]
 * @param {string} [options.distribution="uniform"]
 * @param {boolean} [options.preview=false]
 * @returns {string} - Visualization of the activity graph
 */
function generateActivityVisualization(
  commitDateList,
  startDate,
  endDate,
  { distribution = "uniform", preview = false } = {}
) {
  // Count commits by day (key: YYYY-MM-DD) and by year
  const commitsByDay = {};
  const commitsByYear = {};

  commitDateList.forEach(date => {
    const dateKey = format(date, "YYYY-MM-DD");
    commitsByDay[dateKey] = (commitsByDay[dateKey] || 0) + 1;

    const yearKey = format(date, "YYYY");
    commitsByYear[yearKey] = (commitsByYear[yearKey] || 0) + 1;
  });

  let maxCommitsInDay = 0;
  Object.values(commitsByDay).forEach(count => {
    if (count > maxCommitsInDay) {
      maxCommitsInDay = count;
    }
  });

  const totalDays = differenceInDays(endDate, startDate) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  const result = [];
  result.push(
    chalk.bold.green("This is what you will see on your GitHub profile:")
  );
  result.push("");

  // GitHub-like intensity blocks using Unicode characters
  const intensityBlocks = [
    chalk.hex("#fdfdfd")("■"), // Empty/no commits (white square)
    chalk.hex("#7feebb")("■"), // Few commits (light green)
    chalk.hex("#4ac26b")("■"), // Some commits (medium green)
    chalk.hex("#2da44e")("■"), // Many commits (darker green)
    chalk.hex("#116329")("■") // Most commits (darkest green)
  ];

  // If the total duration is multi-year (> 53 weeks), show yearly breakdown table
  if (totalWeeks > 53) {
    result.push(chalk.bold("Multi-Year History Summary:"));
    result.push("┌────────┬──────────────┬──────────────┐");
    result.push("│  Year  │ Commits      │ Active Days  │");
    result.push("├────────┼──────────────┼──────────────┤");

    const years = Object.keys(commitsByYear).sort();
    for (const yr of years) {
      const yrCount = commitsByYear[yr] || 0;
      let activeDaysInYr = 0;
      for (const [dayKey, c] of Object.entries(commitsByDay)) {
        if (dayKey.startsWith(yr) && c > 0) activeDaysInYr++;
      }
      const yrPad = yr.padEnd(6);
      const commitPad = String(yrCount).padEnd(12);
      const activePad = String(activeDaysInYr).padEnd(12);
      result.push(`│ ${yrPad} │ ${commitPad} │ ${activePad} │`);
    }
    result.push("└────────┴──────────────┴──────────────┘");
    result.push("");
    result.push(
      chalk.italic(
        `Note: Displaying graph for the final 52 weeks of the ${years.length}-year span to fit terminal width:`
      )
    );
    result.push("");
  }

  // Determine date slice for visual grid (max 53 weeks = 371 days)
  const displayDaysCount = Math.min(totalDays, 53 * 7);
  const displayStartDate =
    totalWeeks > 53 ? addDays(endDate, -displayDaysCount + 1) : startDate;
  const gridWeeks = Math.ceil(displayDaysCount / 7);

  const days = [];
  for (let i = 0; i < displayDaysCount; i++) {
    days.push(addDays(displayStartDate, i));
  }

  // Month positions for labels
  const monthLabelPositions = [];
  let currentMonth = null;
  days.forEach((day, index) => {
    const month = format(day, "MMM");
    const week = Math.floor(index / 7);
    if (month !== currentMonth) {
      monthLabelPositions.push({ month, week });
      currentMonth = month;
    }
  });

  // Create month labels row
  let monthRow = "     ";
  for (let i = 0; i < monthLabelPositions.length; i++) {
    const { month, week } = monthLabelPositions[i];
    monthRow += month;
    if (i < monthLabelPositions.length - 1) {
      const nextMonthWeek =
        monthLabelPositions.find(m => m.week > week)?.week || gridWeeks;
      const spacesToAdd = Math.max(
        1,
        Math.round((nextMonthWeek - week - 1) * 1.8)
      );
      monthRow += " ".repeat(spacesToAdd);
    }
  }
  result.push(monthRow);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendar = Array(7)
    .fill()
    .map(() => Array(gridWeeks).fill(null));

  days.forEach((day, index) => {
    const dayOfWeek = getDay(day);
    const week = Math.floor(index / 7);
    if (calendar[dayOfWeek]) {
      calendar[dayOfWeek][week] = day;
    }
  });

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    let row = chalk.bold(dayLabels[dayOfWeek]) + " ";
    for (let week = 0; week < gridWeeks; week++) {
      const day = calendar[dayOfWeek][week];
      if (day) {
        const dateKey = format(day, "YYYY-MM-DD");
        const commitCount = commitsByDay[dateKey] || 0;
        if (commitCount === 0) {
          row += intensityBlocks[0] + " ";
        } else {
          const intensity = Math.min(
            Math.ceil((commitCount / Math.max(1, maxCommitsInDay)) * 4),
            4
          );
          row += intensityBlocks[intensity] + " ";
        }
      } else {
        row += "  ";
      }
    }
    result.push(row);
  }

  result.push("");
  result.push(
    `Legend: ${intensityBlocks[0]} No commits  ${intensityBlocks[1]} Few  ${intensityBlocks[2]} Some  ${intensityBlocks[3]} Many  ${intensityBlocks[4]} Most`
  );
  result.push("");

  // Statistics
  result.push("Statistics");
  result.push(`• Total commits: ${commitDateList.length}`);
  result.push(
    `• Date range: ${format(startDate, "YYYY-MM-DD")} to ${format(
      endDate,
      "YYYY-MM-DD"
    )}`
  );
  result.push(
    `• Distribution: ${distribution || process.env.DISTRIBUTION || "uniform"}`
  );
  result.push(`• Max commits in a day: ${maxCommitsInDay}`);

  if (preview || process.env.PREVIEW) {
    result.push("");
    result.push(
      chalk.italic("Note: This is a preview only. No commits were created.")
    );
    result.push(
      chalk.italic(
        "To generate actual commits, run the command without the --preview flag."
      )
    );
  }

  return result.join("\n");
}

module.exports = generateActivityVisualization;
