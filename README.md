# Timecapsule

A lightweight developer toolkit for generating and experimenting with structured Git history, contribution timelines, and repository workflows.

## Features

- **Coherent Project Scaffolding**: Generates realistic project codebases rather than repeatedly modifying a single text file. Commits incrementally build features, fix bugs, add tests, and update configs.
- **8 Activity Distributions**: Tailor commit cadence to realistic workflows, including human/organic rhythms, standard work hours, evening bursts, consistent output, sporadic activity, or project sprints.
- **Multi-Year History Generation**: Generates years of structured Git history in seconds with exact start and end date controls.
- **Dynamic Message Engine**: Includes 325+ categorized commit messages across 8 engineering disciplines with automatic repetition cooldown buffers.
- **Conventional Commits**: Optional support for Conventional Commits standards (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- **Multi-Language Templates**: Generate repositories scaffolded as JavaScript (Node.js), Python, C++ (CMake), or generic projects.
- **Instant Terminal Preview**: Preview contribution graphs and summary statistics directly in the terminal without creating commits.
- **Programmatic & CLI Access**: Use as a global or local command-line tool, or integrate via a clean Node.js API.

## Installation

Run directly using `npx`:

```bash
npx timecapsule [options]
```

Or install globally:

```bash
npm install -g timecapsule
```

## Quick Start

Preview activity distribution in your terminal:

```bash
npx timecapsule --preview
```

Generate a structured Git history for a specific date range with an organic developer cadence:

```bash
npx timecapsule --startDate 2023-01-01 --endDate 2023-12-31 --distribution human --folder my-repo
```

## Configuration

| Option | Description | Default |
|---|---|---|
| `--commitsPerDay, -c` | Commit range per active day in `"min,max"` format | `"0,4"` |
| `--frequency, -f` | Probability percentage (0–100%) of activity on a given day | `80` |
| `--startDate, -s` | Starting date (`yyyy-MM-dd` or `yyyy/MM/dd`) | 1 year ago |
| `--endDate, -e` | Ending date (`yyyy-MM-dd` or `yyyy/MM/dd`) | Current date |
| `--distribution, -d` | Activity pattern (see [Activity / Distribution](#activity--distribution)) | `"uniform"` |
| `--template, -t` | Scaffolding template: `javascript`, `python`, `cpp`, `generic` | `"javascript"` |
| `--conventional` | Format commit messages using Conventional Commits standard | `false` |
| `--folder, -o` | Destination directory name for the generated repository | `"my-history"` |
| `--preview, -p` | Display terminal activity preview without creating commits | `false` |

## Activity / Distribution

Timecapsule supports multiple activity models to match different contribution patterns:

- **`human`**: Simulates natural developer habits with high weekday activity, weekend balance, and sprint velocity.
- **`uniform`**: Evenly distributed stochastic activity across active days.
- **`workHours`**: Concentrates commits during weekday business hours (9:00 AM – 5:00 PM).
- **`afterWork`**: Emphasizes evening and weekend contributions for side-project workflows.
- **`consistent`**: Steady daily cadence with minimal quiet days.
- **`sporadic`**: Extended inactive intervals punctuated by short, concentrated bursts of commits.
- **`learning`**: Activity steadily ramps up over time, simulating learning a new stack.
- **`project-based`**: Multi-week active milestones separated by quiet intervals between releases.
- **`random`**: Pure unconstrained randomized variability.

## Examples

Preview an active developer rhythm:

```bash
npx timecapsule --distribution human --preview
```

Generate a multi-year history with Conventional Commits:

```bash
npx timecapsule --startDate 2020-01-01 --endDate 2023-12-31 --distribution human --conventional
```

Generate a Python project repository:

```bash
npx timecapsule --template python --folder python-project
```

Generate dense activity with custom daily commit ranges:

```bash
npx timecapsule --startDate 2022-01-01 --endDate 2024-01-01 --commitsPerDay "2,8" --frequency 90 --distribution human
```

## API

Timecapsule provides a programmatic Node.js API:

```javascript
const timecapsule = require("timecapsule");

async function run() {
  const result = await timecapsule({
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    distribution: "human",
    commitsPerDay: "0,8",
    frequency: 85,
    conventional: true,
    folder: "./generated-repo"
  });

  console.log(`Generated ${result.totalCommits} commits.`);
}

run();
```

For complete programmatic parameters, return signatures, and helper modules, see the [API Documentation](docs/api.md).

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/os-trainer/Timecapsule.git
cd Timecapsule
npm install
```

Run test suite:

```bash
npm test
```

Format code:

```bash
npm run lint
```

## License

This project is licensed under the [MIT License](LICENSE).

