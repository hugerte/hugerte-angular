# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The HugeRTE Angular component 1.0.0 is based on the TinyMCE Angular component 9.0.0-rc. Unreleased changes from Tiny made after their 8.0.1 release are included in this changelog.

## Unreleased

### Fixed
- `EventObj` interface not being importable.

## 1.0.3 - 2026-01-19

### Fixed
- Fixed disabled property being ignored during initialization with template-driven forms and ngModel. (Issue #65)
- Removed console log spam left over from debugging.
- Updated dependencies.

## 1.0.2 - 2025-03-21

### Fixed
- The package was missing a required dependency on `@hugerte/framework-integration-shared`.
- Updated dependencies.

## 1.0.1 - 2025-02-21

### Fixed
- Wrong files were published at npm.

## 1.0.0 - 2025-02-21

### Fixed
- Updated dependencies.

### Changed
- HugeRTE dependency is an optional peer dependency.
- The prefix for the uuid-based default editor ID has been changed from `tiny-angular` to `hugerte-angular`.
- The `TINYMCE_SCRIPT_SRC` injection token has been renamed to `HUGERTE_SCRIPT_SRC`.

### Removed
- Removed `apiKey` prop.
- Removed `licenseKey` prop.
- Removed `cloudChannel` prop.

### Added
- Added `cdnVersion` prop.
- `onCommentChange` is now considered a valid event, although it probably comes from a TinyMCE premium plugin anyway.
