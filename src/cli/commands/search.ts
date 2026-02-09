import chalk from 'chalk';

import emailModel from '../../storage/models/email';
import savedSearchModel from '../../storage/models/saved-search';
import logger from '../../utils/logger';
import { formatEmailList } from '../utils/formatter';

/**
 * Search command - Search emails with advanced criteria
 */
function searchCommand(action, options) {
  try {
    // Handle subcommands
    if (action === 'save') {
      return saveSearch(options);
    } else if (action === 'load') {
      return loadSearch(options);
    } else if (action === 'list-saved') {
      return listSavedSearches();
    } else if (action === 'delete-saved') {
      return deleteSavedSearch(options);
    }

    // Treat action as keyword if it's not a subcommand
    const keyword = action;

    const query = buildSearchQuery(keyword, options);

    if (
      Object.keys(query).length === 0 ||
      (Object.keys(query).length === 1 && query.limit)
    ) {
      console.error(chalk.red('Error: Please provide search criteria'));
      console.log('Usage: mail-cli search <keyword> [options]');
      console.log();
      console.log('Options:');
      console.log('  --from <email>        Search by sender');
      console.log('  --to <email>          Search by recipient');
      console.log('  --cc <email>          Search by CC');
      console.log('  --subject <text>      Search by subject');
      console.log('  --folder <name>       Search in specific folder');
      console.log('  --date <date>         Search from date (YYYY-MM-DD)');
      console.log('  --date-to <date>      Search to date (YYYY-MM-DD)');
      console.log('  --starred             Search starred emails');
      console.log('  --flagged             Search flagged emails');
      console.log('  --unread              Search unread emails');
      console.log('  --has-attachment      Search emails with attachments');
      console.log('  --no-attachment       Search emails without attachments');
      console.log('  --tag <name>          Search by tag');
      console.log('  --limit <number>      Limit results (default: 100)');
      console.log();
      console.log('Saved searches:');
      console.log('  search save --name <name>    Save current search');
      console.log('  search load --name <name>    Load saved search');
      console.log('  search list-saved            List saved searches');
      console.log('  search delete-saved --name <name>  Delete saved search');
      process.exit(1);
    }

    // Display search criteria
    console.log(chalk.bold.cyan('Search Criteria:'));
    displaySearchCriteria(query);
    console.log();

    console.log(chalk.bold.cyan('Search Results:'));
    console.log();

    const emails = emailModel.search(query);

    if (emails.length === 0) {
      console.log(chalk.yellow('No emails found matching your criteria.'));
      return;
    }

    console.log(formatEmailList(emails));
    console.log();
    console.log(chalk.gray(`Found ${emails.length} email(s)`));

    // Store last search for potential saving
    global.lastSearchQuery = query;
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Search command failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Build search query from options
 */
function buildSearchQuery(keyword, options) {
  const query = {};

  if (
    keyword &&
    keyword !== 'save' &&
    keyword !== 'load' &&
    keyword !== 'list-saved' &&
    keyword !== 'delete-saved'
  ) {
    query.keyword = keyword;
  }

  if (options.from) query.from = options.from;
  if (options.to) query.to = options.to;
  if (options.cc) query.cc = options.cc;
  if (options.subject) query.subject = options.subject;
  if (options.folder) query.folder = options.folder;
  if (options.date) query.dateFrom = options.date;
  if (options.dateTo) query.dateTo = options.dateTo;
  if (options.starred) query.starred = true;
  if (options.flagged) query.flagged = true;
  if (options.unread) query.unread = true;
  if (options.hasAttachment) query.hasAttachment = true;
  if (options.noAttachment) query.noAttachment = true;
  if (options.tag) query.tag = options.tag;
  if (options.limit) query.limit = parseInt(options.limit);

  return query;
}

/**
 * Display search criteria
 */
function displaySearchCriteria(query) {
  const criteria = [];

  if (query.keyword) criteria.push(`Keyword: "${query.keyword}"`);
  if (query.from) criteria.push(`From: ${query.from}`);
  if (query.to) criteria.push(`To: ${query.to}`);
  if (query.cc) criteria.push(`CC: ${query.cc}`);
  if (query.subject) criteria.push(`Subject: ${query.subject}`);
  if (query.folder) criteria.push(`Folder: ${query.folder}`);
  if (query.dateFrom) criteria.push(`From date: ${query.dateFrom}`);
  if (query.dateTo) criteria.push(`To date: ${query.dateTo}`);
  if (query.starred) criteria.push('Starred: Yes');
  if (query.flagged) criteria.push('Flagged: Yes');
  if (query.unread) criteria.push('Unread: Yes');
  if (query.hasAttachment) criteria.push('Has attachment: Yes');
  if (query.noAttachment) criteria.push('Has attachment: No');
  if (query.tag) criteria.push(`Tag: ${query.tag}`);
  if (query.limit) criteria.push(`Limit: ${query.limit}`);

  criteria.forEach((c) => console.log(chalk.gray(`  ${c}`)));
}

/**
 * Save current search
 */
function saveSearch(options) {
  if (!options.name) {
    console.error(chalk.red('Error: Search name is required'));
    console.log('Usage: search save --name <name>');
    process.exit(1);
  }

  if (!global.lastSearchQuery) {
    console.error(chalk.red('Error: No search to save. Run a search first.'));
    process.exit(1);
  }

  try {
    const searchId = savedSearchModel.create({
      name: options.name,
      query: global.lastSearchQuery,
      description: options.description || '',
    });

    console.log(
      chalk.green('✓'),
      `Search "${options.name}" saved successfully`
    );
    console.log(chalk.gray(`  ID: ${searchId}`));
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Load saved search
 */
function loadSearch(options) {
  if (!options.name) {
    console.error(chalk.red('Error: Search name is required'));
    console.log('Usage: search load --name <name>');
    process.exit(1);
  }

  try {
    const savedSearch = savedSearchModel.findByName(options.name);

    if (!savedSearch) {
      console.error(
        chalk.red('Error:'),
        `Saved search "${options.name}" not found`
      );
      process.exit(1);
    }

    console.log(chalk.bold.cyan(`Loading saved search: "${savedSearch.name}"`));
    if (savedSearch.description) {
      console.log(chalk.gray(`  ${savedSearch.description}`));
    }
    console.log();

    const query = JSON.parse(savedSearch.query);

    console.log(chalk.bold.cyan('Search Criteria:'));
    displaySearchCriteria(query);
    console.log();

    console.log(chalk.bold.cyan('Search Results:'));
    console.log();

    const emails = emailModel.search(query);

    if (emails.length === 0) {
      console.log(chalk.yellow('No emails found matching your criteria.'));
      return;
    }

    console.log(formatEmailList(emails));
    console.log();
    console.log(chalk.gray(`Found ${emails.length} email(s)`));

    // Store for potential re-saving
    global.lastSearchQuery = query;
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

/**
 * List saved searches
 */
function listSavedSearches() {
  try {
    const searches = savedSearchModel.findAll();

    if (searches.length === 0) {
      console.log(chalk.yellow('No saved searches found.'));
      return;
    }

    console.log(chalk.bold.cyan('Saved Searches:'));
    console.log();

    searches.forEach((search) => {
      console.log(chalk.bold(search.name));
      console.log(chalk.gray(`  ID: ${search.id}`));
      if (search.description) {
        console.log(chalk.gray(`  ${search.description}`));
      }
      const query = JSON.parse(search.query);
      const criteriaCount = Object.keys(query).length;
      console.log(chalk.gray(`  Criteria: ${criteriaCount} condition(s)`));
      console.log(
        chalk.gray(`  Created: ${new Date(search.created_at).toLocaleString()}`)
      );
      console.log();
    });

    console.log(chalk.gray(`Total: ${searches.length} saved search(es)`));
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Delete saved search
 */
function deleteSavedSearch(options) {
  if (!options.name) {
    console.error(chalk.red('Error: Search name is required'));
    console.log('Usage: search delete-saved --name <name>');
    process.exit(1);
  }

  try {
    const savedSearch = savedSearchModel.findByName(options.name);

    if (!savedSearch) {
      console.error(
        chalk.red('Error:'),
        `Saved search "${options.name}" not found`
      );
      process.exit(1);
    }

    savedSearchModel.delete(savedSearch.id);
    console.log(
      chalk.green('✓'),
      `Saved search "${options.name}" deleted successfully`
    );
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

module.exports = searchCommand;
