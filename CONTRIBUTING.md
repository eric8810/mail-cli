# Contributing to Open Mail CLI

First off, thank you for considering contributing to Open Mail CLI! It's people like you that make Open Mail CLI such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**
* **Include your environment details** (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the JavaScript styleguide
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/open-mail-cli.git
cd open-mail-cli

# Install dependencies
npm install

# Link for local development
npm link

# Run tests
npm test
```

## Styleguide

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security

### JavaScript Styleguide

* Use 2 spaces for indentation
* Prefer `const` over `let`. Never use `var`
* Use template literals instead of string concatenation
* Use async/await instead of callbacks
* Add JSDoc comments for functions
* Use meaningful variable names

### Documentation Styleguide

* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference functions and classes in backticks: \`functionName()\`

## Project Structure

```
mail-cli/
├── src/
│   ├── cli/          # CLI commands and interface
│   ├── imap/         # IMAP client implementation
│   ├── smtp/         # SMTP client implementation
│   ├── storage/      # Database and models
│   ├── filters/      # Email filtering engine
│   ├── spam/         # Spam detection
│   ├── templates/    # Email templates
│   ├── notifications/# Notification system
│   └── utils/        # Utility functions
├── docs/             # Documentation
└── tests/            # Test files
```

## Testing

* Write tests for new features
* Ensure all tests pass before submitting PR
* Aim for high test coverage

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/specific-test.js
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉
