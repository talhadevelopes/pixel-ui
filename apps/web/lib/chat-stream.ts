export type StreamParseResult = {
  raw: string;
  code?: string;
};

export type ChatStreamOptions = {
  onPartialCode?: (code: string) => void;
};

export async function parseChatCompletionStream(
  response: Response,
  options?: ChatStreamOptions
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming reader unavailable");
  }

  const decoder = new TextDecoder();
  let raw = "";
  let codeBuffer = "";
  let isCode = false;
  const htmlStartRegex =
    /<\s*(section|div|header|main|footer|nav|ul|ol|article|aside|form|img|h1|h2|h3|h4|h5|h6|button|a|span|p|table|figure|canvas|svg)[\s>]/i;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    raw += chunk;

    if (!isCode) {
      const match = raw.match(/```(?:\s*html)?/i);
      if (match && match.index !== undefined) {
        isCode = true;
        const index = match.index + match[0].length;
        codeBuffer += raw.slice(index);
        options?.onPartialCode?.(stripCodeFences(codeBuffer));
      } else {
        const htmlMatch = raw.match(htmlStartRegex);
        if (htmlMatch && htmlMatch.index !== undefined) {
          isCode = true;
          const index = htmlMatch.index;
          codeBuffer += raw.slice(index);
          options?.onPartialCode?.(stripCodeFences(codeBuffer));
        }
      }
    } else {
      codeBuffer += chunk;
      options?.onPartialCode?.(stripCodeFences(codeBuffer));
    }
  }

  let code = codeBuffer ? stripCodeFences(codeBuffer) : undefined;
  if (!code) {
    const htmlMatch = raw.match(htmlStartRegex);
    if (htmlMatch && htmlMatch.index !== undefined) {
      code = stripCodeFences(raw.slice(htmlMatch.index));
    }
  }

  return {
    raw: raw.trim(),
    code,
  } satisfies StreamParseResult;
}

export function stripCodeFences(code: string) {
  return code
    .replace(/```\s*html/gi, "")
    .replace(/```/g, "")
    .trim();
}
