const fs = require("fs/promises");
const path = require("path");
const { glob } = require("glob");

const API_ROUTES_GLOB = "app/api/**/*.ts";

async function updateRouteFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Update imports
    let updatedContent = content
      .replace(
        /import\s*{[^}]*withAuth[^}]*}\s*from\s*["']@\/utils\/withAuth["']/g,
        `import { AuthenticatedRequest, withAuthServer } from "@/utils/withAuthServer";\nimport { makeBackendRequest } from "@/utils/withAuth"`
      )
      .replace(
        /import\s*{\s*AuthenticatedRequest\s*}\s*from\s*["']@\/utils\/withAuth["']/g,
        `import { AuthenticatedRequest } from "@/utils/withAuthServer"`
      );

    // Update withAuth usage
    updatedContent = updatedContent
      .replace(
        /export const (GET|POST|PUT|DELETE|PATCH) = withAuth/g,
        "export const GET = withAuthServer"
      )
      .replace(/request\.auth/g, "req.auth")
      .replace(/request:\s*AuthenticatedRequest/g, "req: AuthenticatedRequest");

    // Write back to file if changes were made
    if (content !== updatedContent) {
      await fs.writeFile(filePath, updatedContent, "utf-8");
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️  Skipped ${filePath} (no changes needed)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function main() {
  try {
    const files = await glob(API_ROUTES_GLOB);
    console.log(`Found ${files.length} route files to process`);

    for (const file of files) {
      await updateRouteFile(file);
    }

    console.log("✨ All files processed");
  } catch (error) {
    console.error("Failed to process files:", error);
    process.exit(1);
  }
}

main();
