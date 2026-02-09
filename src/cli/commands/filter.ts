import filterEngine from '../../filters/engine';
import emailModel from '../../storage/models/email';
import filterModel from '../../storage/models/filter';
import logger from '../../utils/logger';
import { formatTable } from '../utils/formatter';

/**
 * Filter management commands
 */

/**
 * Create a new filter
 */
async function createFilter(options) {
  try {
    if (!options.name) {
      console.error('Error: Filter name is required');
      console.log(
        'Usage: mail-cli filter create --name <name> [--description <desc>]'
      );
      return;
    }

    const filterData = {
      name: options.name,
      description: options.description || null,
      isEnabled: options.enabled !== false,
      priority: options.priority || 0,
      matchAll: options.matchAll !== false,
    };

    const filterId = filterModel.create(filterData);
    console.log(`Filter created successfully (ID: ${filterId})`);
    console.log(`Name: ${options.name}`);
    console.log('Status: Enabled');
    console.log('');
    console.log('Next steps:');
    console.log(
      `  1. Add conditions: mail-cli filter add-condition ${filterId} --field <field> --operator <op> --value <val>`
    );
    console.log(
      `  2. Add actions: mail-cli filter add-action ${filterId} --type <type> [--value <val>]`
    );
    console.log(
      `  3. Test filter: mail-cli filter test ${filterId} <email-id>`
    );
  } catch (error) {
    console.error('Failed to create filter:', error.message);
    logger.error('Create filter failed', { error: error.message });
  }
}

/**
 * Add condition to filter
 */
async function addCondition(filterId, options) {
  try {
    if (!options.field || !options.operator || !options.value) {
      console.error('Error: field, operator, and value are required');
      console.log(
        'Usage: mail-cli filter add-condition <filter-id> --field <field> --operator <op> --value <val>'
      );
      console.log('');
      console.log(
        'Available fields: from, to, cc, subject, body, has_attachments, size, date, folder'
      );
      console.log(
        'Available operators: equals, not_equals, contains, not_contains, starts_with, ends_with, matches_regex, greater_than, less_than, is_empty, is_not_empty'
      );
      return;
    }

    const filter = filterModel.findById(filterId);
    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    const condition = {
      field: options.field,
      operator: options.operator,
      value: options.value,
    };

    filterModel.addCondition(filterId, condition);
    console.log(`Condition added to filter "${filter.name}"`);
    console.log(`  Field: ${condition.field}`);
    console.log(`  Operator: ${condition.operator}`);
    console.log(`  Value: ${condition.value}`);
  } catch (error) {
    console.error('Failed to add condition:', error.message);
    logger.error('Add condition failed', { filterId, error: error.message });
  }
}

/**
 * Add action to filter
 */
async function addAction(filterId, options) {
  try {
    if (!options.type) {
      console.error('Error: action type is required');
      console.log(
        'Usage: mail-cli filter add-action <filter-id> --type <type> [--value <val>]'
      );
      console.log('');
      console.log('Available actions:');
      console.log('  move --value <folder>       - Move email to folder');
      console.log('  mark_read                   - Mark as read');
      console.log('  mark_unread                 - Mark as unread');
      console.log('  star                        - Star email');
      console.log('  unstar                      - Unstar email');
      console.log('  flag                        - Flag email');
      console.log('  unflag                      - Unflag email');
      console.log('  delete                      - Delete email');
      console.log('  mark_spam                   - Mark as spam');
      console.log('  add_tag --value <tag>       - Add tag');
      console.log('  remove_tag --value <tag>    - Remove tag');
      return;
    }

    const filter = filterModel.findById(filterId);
    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    const action = {
      type: options.type,
      value: options.value || null,
    };

    filterModel.addAction(filterId, action);
    console.log(`Action added to filter "${filter.name}"`);
    console.log(`  Type: ${action.type}`);
    if (action.value) {
      console.log(`  Value: ${action.value}`);
    }
  } catch (error) {
    console.error('Failed to add action:', error.message);
    logger.error('Add action failed', { filterId, error: error.message });
  }
}

/**
 * List all filters
 */
async function listFilters(options = {}) {
  try {
    const filters = filterModel.findAll(options);

    if (filters.length === 0) {
      console.log('No filters found');
      return;
    }

    console.log(`\nFilters (${filters.length}):\n`);

    const tableData = filters.map((filter) => ({
      ID: filter.id,
      Name: filter.name.substring(0, 30),
      Enabled: filter.isEnabled ? 'Yes' : 'No',
      Priority: filter.priority,
      Conditions: filter.conditions.length,
      Actions: filter.actions.length,
    }));

    console.log(formatTable(tableData));
  } catch (error) {
    console.error('Failed to list filters:', error.message);
    logger.error('List filters failed', { error: error.message });
  }
}

/**
 * Show filter details
 */
async function showFilter(filterId) {
  try {
    const filter = filterModel.findById(filterId);

    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    console.log(`\nFilter Details:\n`);
    console.log(`ID: ${filter.id}`);
    console.log(`Name: ${filter.name}`);
    console.log(`Description: ${filter.description || 'N/A'}`);
    console.log(`Status: ${filter.isEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`Priority: ${filter.priority}`);
    console.log(
      `Match: ${filter.matchAll ? 'All conditions (AND)' : 'Any condition (OR)'}`
    );
    console.log(`Created: ${new Date(filter.createdAt).toLocaleString()}`);
    console.log(`Updated: ${new Date(filter.updatedAt).toLocaleString()}`);

    if (filter.conditions.length > 0) {
      console.log(`\nConditions (${filter.conditions.length}):`);
      filter.conditions.forEach((cond, idx) => {
        console.log(
          `  ${idx + 1}. ${cond.field} ${cond.operator} "${cond.value}"`
        );
      });
    } else {
      console.log('\nConditions: None');
    }

    if (filter.actions.length > 0) {
      console.log(`\nActions (${filter.actions.length}):`);
      filter.actions.forEach((action, idx) => {
        const valueStr = action.value ? ` (${action.value})` : '';
        console.log(`  ${idx + 1}. ${action.type}${valueStr}`);
      });
    } else {
      console.log('\nActions: None');
    }
  } catch (error) {
    console.error('Failed to show filter:', error.message);
    logger.error('Show filter failed', { filterId, error: error.message });
  }
}

/**
 * Edit filter
 */
async function editFilter(filterId, options) {
  try {
    const filter = filterModel.findById(filterId);

    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    const updates = {};
    if (options.name !== undefined) updates.name = options.name;
    if (options.description !== undefined)
      updates.description = options.description;
    if (options.priority !== undefined)
      updates.priority = parseInt(options.priority);
    if (options.matchAll !== undefined)
      updates.matchAll = options.matchAll === 'true';

    if (Object.keys(updates).length === 0) {
      console.error('Error: No updates provided');
      console.log(
        'Usage: mail-cli filter edit <filter-id> [--name <name>] [--description <desc>] [--priority <num>] [--matchAll <true|false>]'
      );
      return;
    }

    filterModel.update(filterId, updates);
    console.log(`Filter "${filter.name}" updated successfully`);
  } catch (error) {
    console.error('Failed to edit filter:', error.message);
    logger.error('Edit filter failed', { filterId, error: error.message });
  }
}

/**
 * Delete filter
 */
async function deleteFilter(filterId) {
  try {
    const filter = filterModel.findById(filterId);

    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    filterModel.delete(filterId);
    console.log(`Filter "${filter.name}" deleted successfully`);
  } catch (error) {
    console.error('Failed to delete filter:', error.message);
    logger.error('Delete filter failed', { filterId, error: error.message });
  }
}

/**
 * Enable filter
 */
async function enableFilter(filterId) {
  try {
    const filter = filterModel.findById(filterId);

    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    filterModel.enable(filterId);
    console.log(`Filter "${filter.name}" enabled`);
  } catch (error) {
    console.error('Failed to enable filter:', error.message);
    logger.error('Enable filter failed', { filterId, error: error.message });
  }
}

/**
 * Disable filter
 */
async function disableFilter(filterId) {
  try {
    const filter = filterModel.findById(filterId);

    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    filterModel.disable(filterId);
    console.log(`Filter "${filter.name}" disabled`);
  } catch (error) {
    console.error('Failed to disable filter:', error.message);
    logger.error('Disable filter failed', { filterId, error: error.message });
  }
}

/**
 * Test filter on an email
 */
async function testFilter(filterId, emailId) {
  try {
    const filter = filterModel.findById(filterId);
    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    const email = await emailModel.findById(emailId);
    if (!email) {
      console.error(`Error: Email ${emailId} not found`);
      return;
    }

    console.log(`\nTesting filter "${filter.name}" on email #${emailId}:\n`);
    console.log(`Email: ${email.subject}`);
    console.log(`From: ${email.from}`);
    console.log('');

    const result = filterEngine.testFilter(email, filterId);

    if (result.matched) {
      console.log('Result: MATCHED');
      console.log('');
      console.log('Actions that would be executed:');
      filter.actions.forEach((action, idx) => {
        const valueStr = action.value ? ` (${action.value})` : '';
        console.log(`  ${idx + 1}. ${action.type}${valueStr}`);
      });
    } else {
      console.log('Result: NOT MATCHED');
      console.log('');
      console.log('Conditions:');
      filter.conditions.forEach((cond, idx) => {
        console.log(
          `  ${idx + 1}. ${cond.field} ${cond.operator} "${cond.value}"`
        );
      });
    }
  } catch (error) {
    console.error('Failed to test filter:', error.message);
    logger.error('Test filter failed', {
      filterId,
      emailId,
      error: error.message,
    });
  }
}

/**
 * Apply filter to an email
 */
async function applyFilterToEmail(filterId, emailId) {
  try {
    const filter = filterModel.findById(filterId);
    if (!filter) {
      console.error(`Error: Filter ${filterId} not found`);
      return;
    }

    const email = await emailModel.findById(emailId);
    if (!email) {
      console.error(`Error: Email ${emailId} not found`);
      return;
    }

    console.log(`Applying filter "${filter.name}" to email #${emailId}...`);

    const result = await filterEngine.applyFilter(email, filterId);

    if (result.matched) {
      console.log('Filter applied successfully');
      console.log('');
      console.log('Actions executed:');
      result.actions.forEach((action, idx) => {
        const status = action.success ? 'OK' : 'FAILED';
        console.log(
          `  ${idx + 1}. ${action.action}: ${action.message} [${status}]`
        );
      });
    } else {
      console.log(result.message || 'Email does not match filter conditions');
    }
  } catch (error) {
    console.error('Failed to apply filter:', error.message);
    logger.error('Apply filter failed', {
      filterId,
      emailId,
      error: error.message,
    });
  }
}

/**
 * Apply all filters to inbox
 */
async function applyFiltersToInbox(options = {}) {
  try {
    console.log('Applying filters to inbox...');

    const emails = await emailModel.findByFolder('INBOX', {
      limit: options.limit || 100,
    });

    if (emails.length === 0) {
      console.log('No emails in inbox');
      return;
    }

    console.log(`Processing ${emails.length} emails...`);

    const results = await filterEngine.applyFiltersToEmails(emails);

    let matchedCount = 0;
    let errorCount = 0;

    results.forEach((result) => {
      if (result.error) {
        errorCount++;
      } else if (result.matched) {
        matchedCount++;
      }
    });

    console.log('');
    console.log(`Processed: ${emails.length} emails`);
    console.log(`Matched: ${matchedCount} emails`);
    if (errorCount > 0) {
      console.log(`Errors: ${errorCount}`);
    }
  } catch (error) {
    console.error('Failed to apply filters:', error.message);
    logger.error('Apply filters to inbox failed', { error: error.message });
  }
}

/**
 * Show filter statistics
 */
async function showStatistics() {
  try {
    const stats = filterEngine.getStatistics();

    console.log('\nFilter Statistics:\n');
    console.log(`  Total filters: ${stats.totalFilters}`);
    console.log(`  Enabled: ${stats.enabledFilters}`);
    console.log(`  Disabled: ${stats.disabledFilters}`);
  } catch (error) {
    console.error('Failed to get statistics:', error.message);
    logger.error('Get filter statistics failed', { error: error.message });
  }
}

/**
 * Main filter command handler
 */
async function filterCommand(action, ...args) {
  try {
    switch (action) {
      case 'create':
        const createOptions = parseOptions(args);
        await createFilter(createOptions);
        break;

      case 'add-condition':
        if (!args[0]) {
          console.error(
            'Usage: mail-cli filter add-condition <filter-id> --field <field> --operator <op> --value <val>'
          );
          return;
        }
        const condOptions = parseOptions(args.slice(1));
        await addCondition(parseInt(args[0]), condOptions);
        break;

      case 'add-action':
        if (!args[0]) {
          console.error(
            'Usage: mail-cli filter add-action <filter-id> --type <type> [--value <val>]'
          );
          return;
        }
        const actionOptions = parseOptions(args.slice(1));
        await addAction(parseInt(args[0]), actionOptions);
        break;

      case 'list':
        const listOptions = parseOptions(args);
        await listFilters(listOptions);
        break;

      case 'show':
        if (!args[0]) {
          console.error('Usage: mail-cli filter show <filter-id>');
          return;
        }
        await showFilter(parseInt(args[0]));
        break;

      case 'edit':
        if (!args[0]) {
          console.error(
            'Usage: mail-cli filter edit <filter-id> [--name <name>] [--description <desc>] [--priority <num>]'
          );
          return;
        }
        const editOptions = parseOptions(args.slice(1));
        await editFilter(parseInt(args[0]), editOptions);
        break;

      case 'delete':
        if (!args[0]) {
          console.error('Usage: mail-cli filter delete <filter-id>');
          return;
        }
        await deleteFilter(parseInt(args[0]));
        break;

      case 'enable':
        if (!args[0]) {
          console.error('Usage: mail-cli filter enable <filter-id>');
          return;
        }
        await enableFilter(parseInt(args[0]));
        break;

      case 'disable':
        if (!args[0]) {
          console.error('Usage: mail-cli filter disable <filter-id>');
          return;
        }
        await disableFilter(parseInt(args[0]));
        break;

      case 'test':
        if (!args[0] || !args[1]) {
          console.error('Usage: mail-cli filter test <filter-id> <email-id>');
          return;
        }
        await testFilter(parseInt(args[0]), parseInt(args[1]));
        break;

      case 'apply':
        if (!args[0] || !args[1]) {
          console.error('Usage: mail-cli filter apply <filter-id> <email-id>');
          return;
        }
        await applyFilterToEmail(parseInt(args[0]), parseInt(args[1]));
        break;

      case 'apply-all':
        const applyOptions = parseOptions(args);
        await applyFiltersToInbox(applyOptions);
        break;

      case 'stats':
        await showStatistics();
        break;

      default:
        console.log('Filter Management Commands:');
        console.log(
          '  mail-cli filter create --name <name> [--description <desc>]'
        );
        console.log(
          '  mail-cli filter add-condition <id> --field <field> --operator <op> --value <val>'
        );
        console.log(
          '  mail-cli filter add-action <id> --type <type> [--value <val>]'
        );
        console.log('  mail-cli filter list');
        console.log('  mail-cli filter show <id>');
        console.log(
          '  mail-cli filter edit <id> [--name <name>] [--description <desc>]'
        );
        console.log('  mail-cli filter delete <id>');
        console.log('  mail-cli filter enable <id>');
        console.log('  mail-cli filter disable <id>');
        console.log('  mail-cli filter test <filter-id> <email-id>');
        console.log('  mail-cli filter apply <filter-id> <email-id>');
        console.log('  mail-cli filter apply-all [--limit <num>]');
        console.log('  mail-cli filter stats');
    }
  } catch (error) {
    console.error('Filter command failed:', error.message);
    logger.error('Filter command failed', { action, error: error.message });
  }
}

/**
 * Parse command line options
 */
function parseOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value =
        args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      options[key] = value;
      if (value !== true) i++;
    }
  }
  return options;
}

module.exports = filterCommand;
