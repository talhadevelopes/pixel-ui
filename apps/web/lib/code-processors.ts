
export const stripFences = (code: string): string => {
  if (!code) return "";
  let result = code
    .replace(/```\s*html/gi, "")
    .replace(/```/g, "")
    .replace(/<\/?(html|head|body|title)[^>]*>/gi, "")
    .trim();

  // REPAIR LOGIC: Close unclosed attributes and tags
  // 1. Close unclosed quotes in classes/styles
  const openQuotes = (result.match(/"/g) || []).length;
  if (openQuotes % 2 !== 0) {
    result += '"';
  }

  // 2. Ensure the last tag is closed if it looks like an opening tag
  if (result.endsWith(">") === false && result.includes("<")) {
    result += ">";
  }

  return result;
};

export const sanitizeScripts = (code: string): string => {
  console.log("sanitizeScripts input length:", code?.length);
  return code;
};

export const stripTrailingMetadata = (code: string): string => {
  console.log("stripTrailingMetadata input length:", code?.length);
  const result = (code ?? "").trim();
  console.log("stripTrailingMetadata output length:", result?.length);
  return result;
};

export const replaceInnerInOuter = (
  outerHTML: string,
  innerHTML: string,
  newInnerHTML: string
): string | null => {
  try {
    const idx = outerHTML.indexOf(innerHTML);
    if (idx === -1) return null;
    return (
      outerHTML.slice(0, idx) + 
      newInnerHTML + 
      outerHTML.slice(idx + innerHTML.length)
    );
  } catch {
    return null;
  }
};

export const patchRenderedCodeForSelection = (
  selected: any,
  newInner: string,
  code: string
): string | null => {
  const { outerHTML, innerHTML } = selected || {};
  if (!outerHTML || innerHTML === undefined) return null;
  
  const newOuter = replaceInnerInOuter(outerHTML, innerHTML, newInner);
  if (!newOuter) return null;
  
  const idx = code.indexOf(outerHTML);
  if (idx === -1) return null;
  
  return code.slice(0, idx) + newOuter + code.slice(idx + outerHTML.length);
};