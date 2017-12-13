/* eslint-disable no-extra-parens */

// This module interprets the syntax of the Display Control Configuration File
// as mentioned in the design document.

function parseContent(content) {
  if (!content) {
    return null;
  }

  return (content
    .split("\n")
    .filter(line => line.includes('='))
    .map(line => line.trim().split('='))
    .reduce((settings, [key, value]) =>
      Object.assign(settings, {[key]: value}), {}
    )
  );
}

module.exports = {parseContent};
