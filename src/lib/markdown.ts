import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export async function markdownToHtml(content: string): Promise<string> {
  // Strip the first # heading (title is rendered by the page component)
  const stripped = content.replace(/^\s*#\s+.+\n*/m, "").trimStart();
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(stripped);
  return result.toString();
}
