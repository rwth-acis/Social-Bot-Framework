export function isErrorResponse(responseText) {
  if (typeof responseText === "string") {
    return !responseText.includes("<?xml");
  }
  return false;
}
