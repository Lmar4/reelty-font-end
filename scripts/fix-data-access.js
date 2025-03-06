/**
 * This script helps identify and fix data access patterns in the codebase
 * after updating the API response unwrapping logic.
 *
 * Usage:
 * 1. Run this script with Node.js
 * 2. It will print a list of files that need to be updated
 * 3. Follow the instructions to update each file
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Patterns to search for
const patterns = [
  "userData?.data",
  "userData.data",
  "user?.data",
  "user.data",
  "listing?.data",
  "listing.data",
  "subscriptionTiers?.data",
  "subscriptionTiers.data",
  "rawJobsData?.data",
  "rawJobsData.data",
];

// Run grep to find all occurrences
console.log("Searching for data access patterns to fix...\n");

patterns.forEach((pattern) => {
  try {
    const result = execSync(
      `grep -r "${pattern}" --include="*.tsx" --include="*.ts" reelty-front/`
    ).toString();
    if (result) {
      console.log(`\n=== Files containing "${pattern}" ===`);
      console.log(result);
    }
  } catch (error) {
    // No matches found
  }
});

console.log("\n=== Instructions ===");
console.log("1. For each file listed above, update the data access pattern:");
console.log('   - Change "userData?.data?.property" to "userData?.property"');
console.log('   - Change "userData.data.property" to "userData.property"');
console.log('   - Change "listing?.data" to "listing"');
console.log('   - Change "subscriptionTiers?.data" to "subscriptionTiers"');
console.log('   - Change "rawJobsData?.data" to "rawJobsData"');
console.log("2. Run TypeScript type checking to verify your changes");
console.log("3. Test the application to ensure everything works correctly");
