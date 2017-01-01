/**
 * Initial file definitions and structures for synthetic project templates.
 */

const TEMPLATES = {
  javascript: {
    name: "javascript",
    description: "Modern JavaScript / Node.js library layout",
    files: {
      "package.json":
        JSON.stringify(
          {
            name: "timecapsule-core",
            version: "1.0.0",
            description: "Core modular utilities and workflow pipeline",
            main: "src/index.js",
            scripts: {
              start: "node src/index.js",
              test: "node --test tests/**/*.test.js"
            },
            keywords: ["timecapsule", "git-tools", "utilities", "workflow"],
            license: "MIT"
          },
          null,
          2
        ) + "\n",

      ".gitignore": "node_modules/\ndist/\ncoverage/\n*.log\n.DS_Store\n",

      "README.md": `# Timecapsule Core

Core modular utilities, configuration handling, and structured data processing pipeline.

## Overview
This library provides core utility functions, configuration handling, and data processing routines.

## Installation
\`\`\`bash
npm install
\`\`\`

## Quick Start
\`\`\`javascript
const { run, validateInput } = require("./src");
console.log(validateInput("example"));
\`\`\`
`,

      "src/config.js": `/**
 * Application configuration loader and default options.
 */

const DEFAULT_CONFIG = {
  appName: "TimecapsuleCore",
  version: "1.0.0",
  timeoutMs: 5000,
  debugMode: false,
  maxBatchSize: 100
};

function loadConfig(overrides = {}) {
  return Object.assign({}, DEFAULT_CONFIG, overrides);
}

module.exports = {
  DEFAULT_CONFIG,
  loadConfig
};
`,

      "src/utils.js": `/**
 * Core utility functions and validation helpers.
 */

function validateInput(value) {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
}

function formatSummary(title, count) {
  return \`[\${title}] Total: \${count}\`;
}

module.exports = {
  validateInput,
  formatSummary
};
`,

      "src/index.js": `/**
 * Primary library entry point.
 */

const { loadConfig } = require("./config");
const { validateInput, formatSummary } = require("./utils");

function run(options = {}) {
  const config = loadConfig(options);
  const isValid = validateInput(config.appName);
  return {
    status: isValid ? "ready" : "invalid",
    config
  };
}

module.exports = {
  run,
  loadConfig,
  validateInput,
  formatSummary
};
`,

      "tests/utils.test.js": `/**
 * Unit tests for utility and configuration logic.
 */

const assert = require("assert");
const { validateInput, formatSummary } = require("../src/utils");

// Baseline validation tests
assert.strictEqual(validateInput("valid"), true, "Should validate non-empty string");
assert.strictEqual(validateInput(""), false, "Should reject empty string");
assert.strictEqual(validateInput(null), false, "Should reject null value");
assert.ok(formatSummary("Items", 5).includes("Total: 5"));
console.log("All baseline tests passed successfully.");
`
    }
  },

  python: {
    name: "python",
    description: "Standard Python application layout",
    files: {
      "requirements.txt": `# Core dependencies
requests>=2.28.0
pytest>=7.0.0
`,

      ".gitignore": "__pycache__/\n*.pyc\n.pytest_cache/\n.env\nvirtualenv/\n",

      "README.md": `# Timecapsule Core (Python)

A modular Python utility package featuring configuration management, data validation, and helper routines.

## Overview
A modular Python utility package featuring configuration management, data validation, and helper routines.

## Installation
\`\`\`bash
pip install -r requirements.txt
\`\`\`
`,

      "src/config.py": `"""Application configuration loader."""

DEFAULT_CONFIG = {
    "app_name": "TimecapsuleCore",
    "version": "1.0.0",
    "timeout_seconds": 10,
    "debug_mode": False
}

def load_config(overrides=None):
    config = DEFAULT_CONFIG.copy()
    if overrides:
        config.update(overrides)
    return config
`,

      "src/utils.py": `"""Utility functions and validation routines."""

def validate_input(val):
    if val is None:
        return False
    if isinstance(val, str):
        return len(val.strip()) > 0
    return True

def format_summary(title, count):
    return f"[{title}] Total: {count}"
`,

      "src/main.py": `"""Application entry point."""

from src.config import load_config
from src.utils import validate_input, format_summary

def run(options=None):
    config = load_config(options)
    is_valid = validate_input(config.get("app_name"))
    return {"status": "ready" if is_valid else "invalid", "config": config}

if __name__ == "__main__":
    result = run()
    print("Execution result:", result)
`,

      "tests/test_utils.py": `"""Test suite for utility functions."""

from src.utils import validate_input, format_summary

def test_validation():
    assert validate_input("valid") is True
    assert validate_input("") is False
    assert validate_input(None) is False

def test_formatting():
    assert "Total: 10" in format_summary("Count", 10)
`
    }
  },

  cpp: {
    name: "cpp",
    description: "Standard C++ / CMake library layout",
    files: {
      "CMakeLists.txt": `cmake_minimum_required(VERSION 3.15)
project(TimecapsuleCore CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

add_library(demo_utils src/utils.cpp)
add_executable(demo_app src/main.cpp)
target_link_libraries(demo_app demo_utils)
`,

      ".gitignore": "build/\nbin/\n*.o\n*.a\n.vscode/\n",

      "README.md": `# Timecapsule Core (C++)

A lightweight C++ utility library featuring robust string and parameter validation routines.

## Building the Project
\`\`\`bash
mkdir build && cd build
cmake ..
cmake --build .
\`\`\`
`,

      "include/utils.hpp": `#pragma once

#include <string>

namespace demo {
    bool validate_input(const std::string& input);
    std::string format_summary(const std::string& title, int count);
}
`,

      "src/utils.cpp": `#include "utils.hpp"
#include <sstream>

namespace demo {
    bool validate_input(const std::string& input) {
        return !input.empty();
    }

    std::string format_summary(const std::string& title, int count) {
        std::ostringstream ss;
        ss << "[" << title << "] Total: " << count;
        return ss.str();
    }
}
`,

      "src/main.cpp": `#include <iostream>
#include "utils.hpp"

int main() {
    bool valid = demo::validate_input("Timecapsule Core Ready");
    std::cout << demo::format_summary("App Status", valid ? 1 : 0) << std::endl;
    return 0;
}
`,

      "tests/test_main.cpp": `#include <cassert>
#include <iostream>
#include "utils.hpp"

int main() {
    assert(demo::validate_input("test") == true);
    assert(demo::validate_input("") == false);
    std::cout << "All C++ tests passed!" << std::endl;
    return 0;
}
`
    }
  },

  generic: {
    name: "generic",
    description: "Language-agnostic project layout",
    files: {
      "config.json":
        JSON.stringify(
          {
            project: "timecapsule-core",
            version: "1.0.0",
            environment: "production",
            settings: {
              logLevel: "info",
              retries: 3
            }
          },
          null,
          2
        ) + "\n",

      ".gitignore": "*.log\n*.tmp\noutput/\nbuild/\n",

      "README.md": `# Timecapsule Core

Language-agnostic workflow scripts, configuration handling, and specifications.

## Structure
- \`src/\`: Application logic and operational scripts
- \`docs/\`: Project documentation and workflow specifications
- \`tests/\`: Automated test harness and verification suites
`,

      "src/app.sh": `#!/usr/bin/env bash
# Core application workflow script
set -euo pipefail

echo "Running workflow..."
source src/helpers.sh
validate_environment
echo "Workflow completed successfully."
`,

      "src/helpers.sh": `#!/usr/bin/env bash
# Operational helper routines

validate_environment() {
  if [ -z "\${PROJECT_ENV:-}" ]; then
    export PROJECT_ENV="production"
  fi
  echo "Environment validated: \$PROJECT_ENV"
}

format_metric() {
  local name="\$1"
  local val="\$2"
  echo "metric:\$name=\$val"
}
`,

      "docs/overview.md": `# Project Architecture and Design Overview

This document provides a conceptual architecture specification for the core suite.

## Pipeline Flow
1. Load configuration parameters
2. Validate inputs and environment
3. Execute core task routines
4. Log metrics and exit cleanly
`,

      "tests/run_tests.sh": `#!/usr/bin/env bash
# Test execution suite
set -euo pipefail

echo "Running test suite..."
source src/helpers.sh
validate_environment
format_metric "tests_run" "1"
echo "All test checks passed."
`
    }
  }
};

module.exports = {
  TEMPLATES
};
