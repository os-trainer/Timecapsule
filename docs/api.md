# Timecapsule API Reference

Timecapsule can be used programmatically in Node.js applications as well as via the command-line interface.

## Import

```javascript
const timecapsule = require("timecapsule");
```

---

## `timecapsule(options)`

Generates a repository with structured Git commit history or returns preview metadata.

### Parameters

| Option | Type | Default | Description |
|---|---|---|---|
| `commitsPerDay` | `string` | `"0,4"` | Commit range per active day in `"min,max"` format (e.g. `"0,8"`). |
| `frequency` | `number` | `80` | Probability percentage (`0`–`100`) of generating commits on any given day. |
| `startDate` | `string` \| `Date` | 1 year ago | Start date (`yyyy-MM-dd`, `yyyy/MM/dd`, or ISO date string). |
| `endDate` | `string` \| `Date` | Today | End date (`yyyy-MM-dd`, `yyyy/MM/dd`, or ISO date string). Strictly capped at specified cutoff. |
| `distribution` | `string` | `"uniform"` | Activity pattern: `human`, `uniform`, `workHours`, `afterWork`, `consistent`, `sporadic`, `learning`, `project-based`, `random`. |
| `preview` | `boolean` | `false` | When `true`, prints terminal graph and returns statistics without writing to disk. |
| `template` | `string` | `"javascript"` | Scaffolding template: `"javascript"`, `"python"`, `"cpp"`, or `"generic"`. |
| `conventional` | `boolean` | `false` | When `true`, formats commit messages using Conventional Commits (`feat:`, `fix:`, etc.). |
| `folder` | `string` | `"my-history"` | Relative or absolute path to the destination directory. |

### Return Value

Returns a `Promise<Object>` resolving to execution statistics:

```typescript
interface TimecapsuleResult {
  preview: boolean;
  totalCommits: number;
  startDate: Date;
  endDate: Date;
  distribution: string;
  targetDir?: string;
}
```

---

## Examples

### Basic History Generation

```javascript
const timecapsule = require("timecapsule");

async function generate() {
  const result = await timecapsule({
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    distribution: "human",
    commitsPerDay: "0,8",
    frequency: 85,
    conventional: true,
    folder: "./output-repo"
  });

  console.log(`Generated ${result.totalCommits} commits in ${result.targetDir}`);
}

generate();
```

### Preview Mode

Preview the activity distribution and calculate total commits without writing any files or Git commits:

```javascript
const timecapsule = require("timecapsule");

async function preview() {
  const result = await timecapsule({
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    distribution: "human",
    preview: true
  });

  console.log(`Estimated commits: ${result.totalCommits}`);
}

preview();
```

### Python Template with Work-Hours Distribution

```javascript
const timecapsule = require("timecapsule");

async function generatePython() {
  await timecapsule({
    template: "python",
    distribution: "workHours",
    commitsPerDay: "1,5",
    frequency: 90,
    folder: "./python-sample"
  });
}

generatePython();
```

---

## Utility Modules

For advanced programmatic use cases, internal generators can be imported directly:

### `dates`

```javascript
const { createCommitDateList, safeParseDate } = require("timecapsule/src/dates");

const dates = createCommitDateList({
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-03-31"),
  distribution: "human",
  commitsPerDay: "0,8",
  frequency: 85
});
```

### `messages`

```javascript
const { MessageGenerator } = require("timecapsule/src/messages");

const generator = new MessageGenerator({ conventional: true });
const next = generator.nextCommit({ progressRatio: 0.5 });
console.log(next.message); // e.g. "feat: add input sanitization for user payload"
```
