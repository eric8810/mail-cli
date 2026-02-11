# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-08

### Added

#### P0 Features (Core)
- ✨ Full IMAP/SMTP email client implementation
- 📬 Email synchronization with local SQLite storage
- 📧 Send and receive emails with attachment support
- 📋 Email listing with pagination and filtering
- 🔍 Basic email search functionality
- ⚙️ Interactive configuration wizard
- 🗂️ Folder management (INBOX, Sent, Drafts, Trash)
- 🔖 Mark emails as read/unread, starred, important
- 🗑️ Delete and trash management
- 📎 Attachment handling and download

#### P1 Features (Advanced)
- 🧵 **Email Threading** - Automatic conversation grouping
- 👥 **Contact Management** - Address book with groups and auto-collection
- ✍️ **Email Signatures** - Multiple signatures with smart insertion
- 🛡️ **Spam Detection** - Bayesian filtering with customizable rules
- 🔍 **Advanced Filters** - Rule-based email automation
- ⚡ **Quick Filters** - One-click filtering for common scenarios
- 💾 **Saved Searches** - Bookmark complex search queries
- 🔄 **Background Sync Daemon** - Automatic email synchronization
- 📊 **Multi-Account Support** - Manage multiple email accounts

#### P2 Features (Power User)
- 📝 **Email Templates** - Variable substitution with `{{placeholders}}`
- 🔔 **Smart Notifications** - Desktop alerts with intelligent filtering
- 📦 **Import/Export** - Full support for EML and MBOX formats
- 🔐 **Enhanced Multi-Account** - Seamless account switching

### Technical Improvements
- 🏗️ Modular architecture with clean separation of concerns
- 🗄️ SQLite database with migrations support
- 🔒 Encrypted password storage
- 📝 Comprehensive logging system
- ⚡ Performance optimizations with database indexing
- 🧪 100% test coverage for core features
- 📚 Extensive documentation

### Security
- 🔐 Password encryption using industry-standard algorithms
- 🔒 Forced TLS/SSL connections for IMAP/SMTP
- 🛡️ Input validation and sanitization
- 🚫 SQL injection prevention with prepared statements

## [Unreleased]

### Added
- 🌐 **HTTP API Mode** - RESTful API for email management via local HTTP server (Hono framework)
  - `GET /api/emails` - List emails with pagination
  - `GET /api/emails/:id` - Get email details
  - `POST /api/emails` - Send email
  - `POST /api/emails/:id/mark-read` - Mark as read/unread
  - `POST /api/emails/:id/star` - Star/unstar email
  - `GET /api/accounts` - List accounts
  - `GET /api/accounts/:id` - Get account details
  - `POST /api/accounts` - Add account
  - `POST /api/sync` - Trigger synchronization
  - `GET /api/sync/status` - Get sync status
  - Built-in Swagger UI documentation at `/api/docs`
  - OpenAPI specification at `/api/openapi.json`
  - Localhost-only access restriction
  - `mail-cli serve` command to start HTTP API server

### Planned Features
- 📱 Mobile companion app
- 🌐 Web interface
- 🔌 Plugin system for extensibility
- 🎨 Customizable themes
- 📊 Email analytics and insights
- 🤖 AI-powered email categorization
- 🔗 Integration with popular services (Slack, Trello, etc.)

---

[1.0.0]: https://github.com/eric8810/open-mail-cli/releases/tag/v1.0.0
