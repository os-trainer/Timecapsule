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
