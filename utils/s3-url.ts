/**
 * Removes query parameters from S3 URLs to get the base URL
 * This is useful when dealing with signed URLs that expire
 * @param url The full S3 URL including query parameters
 * @returns The base URL without query parameters
 */
export function getBaseS3Url(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  } catch (error) {
    console.error("Invalid URL:", url);
    return url;
  }
}

/**
 * Gets the file extension from a URL or file path
 * @param url The URL or file path
 * @returns The file extension (e.g., 'png', 'jpg', 'webp')
 */
export function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = pathname.split(".").pop()?.toLowerCase() || "";
    return extension;
  } catch (error) {
    console.error("Invalid URL:", url);
    return "";
  }
}
