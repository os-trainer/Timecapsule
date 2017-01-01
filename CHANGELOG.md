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
