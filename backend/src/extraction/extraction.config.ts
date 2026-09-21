// Master switch for calling Claude. While this is false, POST /extract returns a 503
// and no tokens are spent. Set it to true only while demoing or testing, then set it
// back to false and redeploy. Never commit it as true.
export const EXTRACTION_ENABLED: boolean = false;

// Lets the service receive the value by injection, so tests can turn it on or off.
export const EXTRACTION_ENABLED_TOKEN = 'EXTRACTION_ENABLED';
