/* eslint-disable no-useless-escape */
'use strict';
const chalk = require('chalk');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const writeGood = require('write-good');

let errorCount = 0;
let warningCount = 0;
const errors = {};
const warnings = {};

let pages = glob.sync('docs/**/*.md');
pages.forEach(function checkPage (pagePath) {
  var match;
  var referencedMatch;
  var referencingMatch;
  var referencingRegex;
  var urlRegex;

  let content = fs.readFileSync(pagePath, 'utf-8');

  // Check prose with `write-good`.
  checkProse(pagePath, content);

  // Inline links: `[link](../page.md)`
  let inlineLinkRegex = /\[.*?\]\((.*?)\)/g;
  match = inlineLinkRegex.exec(content);
  while (match !== null) {
    if (!checkLink(pagePath, match[1])) {
      addError(pagePath, match[0], 'Page does not exist');
    }
    match = inlineLinkRegex.exec(content);
  }

  // Referenced links: `[link][page] -> [page]: ../page.md`
  let referencedLinkRegex = /\[.*?\]\[(.*?)\]/g;
  match = referencedLinkRegex.exec(content);
  while (match !== null) {
    urlRegex = new RegExp(`\\[${match[1]}\\]: \(\.\*\)`, 'g');
    referencedMatch = urlRegex.exec(content);

    if (referencedMatch) {
      if (!checkLink(pagePath, referencedMatch[1])) {
        addError(pagePath, referencedMatch[0], 'Page does not exist');
      }
    } else {
      addError(pagePath, match[0], 'Link definition does not exist');
    }

    match = referencedLinkRegex.exec(content);
  }

  // Unused defined links: `[page]: ../page.md -> [*][page]`
  let referenceRegex = new RegExp('\\[\(\.\*\)\?\\]: \.\*', 'g');
  match = referenceRegex.exec(content);
  while (match !== null) {
    referencingRegex = new RegExp(`\\[${match[1]}\\]`, 'g');
    referencingMatch = referencingRegex.exec(content);
    if (!referencingMatch) {
      addError(pagePath, match[1], 'Link definition not being used');
    }
    match = referenceRegex.exec(content);
  }
});

function checkLink (pagePath, url) {
  var absPath;
  var content;
  var hash;
  var headingMatch;
  var headingRegex;
  var headingIds;
  var urlPath;

  // Relative path.
  if (url.indexOf('.') === 0) {
    // Check page exists.
    urlPath = url.split('#')[0];
    absPath = path.resolve(pagePath, `../${urlPath}`);
    if (!fs.existsSync(absPath)) { return false; }
    if (url.indexOf('#') === -1) { return true; }

    // Check hash / anchor heading.
    headingIds = [];
    hash = url.split('#')[1];
    headingRegex = /#+\s+(.*?)\n/g;
    content = fs.readFileSync(absPath, 'utf-8');
    headingMatch = headingRegex.exec(content);
    while (headingMatch !== null) {
      headingIds.push(convertHeading(headingMatch[1]));
      headingMatch = headingRegex.exec(content);
    }
    return headingIds.indexOf(hash) !== -1;
  }

  return true;
}

function convertHeading (heading) {
  return heading
    .replace(/#+\s+/, '')
    .toLowerCase()
    .replace(/`\./g, '')  // Remove leading dot.
    .replace(/[`*\(\),]/g, '')  // Remove special characters.
    .replace(/[^\w]+/g, '-')
    .replace(/-$/g, '');
}

function checkProse (pagePath, content) {
  content = content.replace(/^---[\s\S]*?---/g, '');  // Remove metadata.
  content = content.replace(/(\|.*\|)+/g, '');  // Remove tables.
  content = content.replace(/```[\s\S]*?```/g, '');  // Remove code blocks.
  content = content.replace(/`[\s\S]*?`/g, '');  // Remove inline code.
  content = content.replace(/\n#+.*/g, '');  // Remove headings.
  writeGood(content, {adverb: false, illusion: false}).forEach(function add (error) {
    addWarning(
      pagePath,
      `...${content.substring(error.index - 10, error.index + error.offset + 10).replace(/\n/g, '')}...`,
      error.reason);
  });
}

function addError (pagePath, str, message) {
  if (!errors[pagePath]) { errors[pagePath] = []; }
  errors[pagePath].push({
    message: message,
    str: str
  });
  errorCount++;
}

function addWarning (pagePath, str, message) {
  if (!warnings[pagePath]) { warnings[pagePath] = []; }
  warnings[pagePath].push({
    message: message,
    str: str
  });
  warningCount++;
}

Object.keys(warnings).forEach(function (pagePath) {
  console.log(chalk.yellow.bold(`\n[warn]: ${pagePath}`));
  warnings[pagePath].forEach(function (warning) {
    console.log(chalk.yellow(`    ${warning.message}: `) + `${warning.str}`);
  });
});

Object.keys(errors).forEach(function (pagePath) {
  console.log(chalk.red.bold(`\n[error]: ${pagePath}`));
  errors[pagePath].forEach(function (error) {
    console.log(chalk.red(`    ${error.message}: `) + `${error.str}`);
  });
});

console.log(chalk.yellow.bold(`${warningCount} warnings`));
console.log(chalk.red.bold(`${errorCount} errors`));

// Fail.
if (errorCount) { process.exit(1); }
