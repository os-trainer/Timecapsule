# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-07

### Added
- Multi-year timeline engine capable of processing 10-year ranges (<15ms).
- Dynamic message catalog containing 325+ realistic commit messages across 8 engineering disciplines.
- Repetition cooldown buffer preventing immediate and near-term duplicate messages.
- 8 activity distributions (`human`, `uniform`, `workHours`, `afterWork`, `consistent`, `sporadic`, `learning`, `project-based`, `random`).
- Multi-language scaffolding templates (`javascript`, `python`, `cpp`, `generic`).
- Support for Conventional Commits formatting (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Safe Git execution using array-based argument vectors to prevent command injection.
- Terminal ANSI activity preview graph without disk mutation.
- Programmatic Node.js API with comprehensive parameter schema.

### Changed
- Rebranded project identity, CLI binaries, and documentation to `Timecapsule`.
- Structured repository file mutator to apply realistic incremental changes across source, test, and config files.
- Replaced legacy text file writes with coherent multi-file project scaffolding.

## [1.0.0] - 2020-09-15

### Added
- Initial release of Git history generation tool.
- Basic date generation and commit creation utilities.
- Add initial sample configuration file
- Add detailed architecture overview and component diagram
- Update package version in manifest file
- Add colorized terminal output formatter
- Improve package scripts for building and testing
- Remove dead code branches and redundant checks
- Add quick reference cheat sheet for CLI commands
- Fix unhandled promise rejection in async error handler
- Add safe deep clone utility function
- Standardize exception messages across validation logic
- Establish baseline directory hierarchy and exports
- Document configuration options and default parameters
- Simplify error throwing and propagation mechanisms
- Add assertions to catch illegal state during execution
- Add schema validation for configuration objects
- Document logging levels and diagnostic flags
- Add test cases for boolean flag normalization
- Add custom formatting options for summary tables
- Verify platform-specific path handling in test suite
- Document template options for supported project layouts
- Implement command line flag alias mapping
- Eliminate code duplication in internal helper branches
- Fix duplicate item registration in event subscriber list
- Verify cache invalidation logic under test conditions
- Add basic application bootstrap logic
- Fix formatting anomaly in terminal progress display
- Fix circular reference error in object serialization
- Ensure consistent parameter ordering in helper signatures
- Add safe string truncation helper
- Implement dry-run execution preview mode
- Configure output directory paths for build pipeline
- Document supported platforms and shell environments
- Implement safe JSON parsing with fallback values
- Add task definitions for local development tooling
- Implement configuration file loader with fallback defaults
- Reorganize internal test helpers and fixtures
- Implement query filter helpers for collection items
- Add badges for license, build status, and version
- Add clean script to purge build artifacts and temp files
- Add snapshot tests for terminal output formatters
- Implement batch processing utility for array inputs
- Add defensive fallbacks for unexpected null values
- Implement date formatting and parsing helpers
- Add assertions for default configuration fallbacks
- Implement deep object merging utility
- Introduce mock harness for file system operations
- Add unit tests for terminal colorization toggles
- Add reusable string formatting utility functions
- Reduce duplicated logic across helper utilities
- Test custom date formatting tokens and output strings
- Clarify frequency parameter behavior and percentage rules
- Simplify complex function implementations for maintainability
- Implement command dispatcher with routing logic
- Verify retry logic behavior under simulated failures
- Refactor argument parsing to standardize option names
- Implement defensive parameter sanitization
- Fix incorrect boolean flag evaluation
- Add parameterized tests for date parsing variations
- Add input validation for user-supplied options
- Document date format requirements and accepted tokens
- Fix incorrect status code returned on input error
- Add regression test for boundary date calculations
- Extract common constants into centralized configuration
- Update README with example workflow scenarios
- Improve clarity of variable scopes and closures
- Streamline event dispatching mechanism
- Fix off-by-one error in collection index calculations
- Add tests for custom output destination formatting
- Remove dead code branches and redundant checks
- Adjust timeout thresholds for integration test suite
- Handle malformed JSON configuration without crashing
- Handle empty environment variables without error
- Implement object transformation and mapping utilities
- Ensure all async rejections provide meaningful Error instances
- Document logging levels and diagnostic flags
- Add regression tests for previous edge-case bugs
- Extract reusable helper functions from main workflow
- Implement numeric range clamping helper
- Refactor state management into centralized store
- Implement configuration merging priority logic
- Correct output formatting when statistics are zero
- Add test cases for boolean flag normalization
- Add basic data processing and normalization pipeline
- Correct negative duration calculations across days
- Refactor promise handling to use modern async/await patterns
- Add unit tests for collection filter predicates
- Add examples of integrating tool into automated scripts
- Handle missing configuration gracefully with defaults
- Implement dry-run execution preview mode
- Fix inconsistent return type on validation failure
- Implement customizable output formatting options
- Verify cache invalidation logic under test conditions
- Fix memory leak in recurring event listeners
- Modernize internal loop constructs and data structures
- Add schema validation for configuration objects
- Clarify installation instructions and system prerequisites
- Refactor caching mechanism for cleaner abstraction
- Standardize indentation and line wrapping across files
- Add FAQ section covering common configuration questions

## [1.1.0]
### Changed
- Add lightweight event emitter implementation
- Fix edge case in input handling for empty strings
- Add snapshot tests for terminal output formatters
- Modularize schema definitions and validation rules
- Fix incorrect default parameter assignment
- Add usage examples for common command-line options
- Configure environment file loading conventions
- Handle null and undefined options defensively
