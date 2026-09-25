import { createHash } from "node:crypto";

export const SHOW_BLOCK_REGEX =
  /<!--\s*@show\s*-->\s*```html\r?\n([\s\S]*?)\r?\n```/gi;

const SHOW_PREVIEW_WRAPPER = 'data-seele-show-preview="true"';
const SHOW_PREVIEW_REGEX =
  /^<div data-seele-show-preview="true">\n?([\s\S]*?)\n?<\/div>$/;

const renderShowPreview = (code, env, render) => {
  const wrapped = render(
    `<div ${SHOW_PREVIEW_WRAPPER}>\n${code}\n</div>`,
    env,
  ).trim();
  const match = wrapped.match(SHOW_PREVIEW_REGEX);
  return match ? match[1] : code;
};

export const renderMarkdownShowBlocks = (src, env, render) => {
  if (!src) return render(src, env);

  /** @type {string[]} */
  const showBlocks = [];
  const showBlockToken = `__SHOW_BLOCK_${createHash("sha1").update(src).digest("hex").slice(0, 12)}__`;
  src = src.replace(SHOW_BLOCK_REGEX, (_, code) => {
    const idx = showBlocks.push(code) - 1;
    return `\n<!--${showBlockToken}:${idx}-->\n`;
  });

  const html = render(src, env);
  if (!showBlocks.length) return html;

  return html.replace(
    new RegExp(`<!--${showBlockToken}:(\\d+)-->`, "g"),
    (_, idx) => {
      const code = showBlocks[Number(idx)];
      const preview = renderShowPreview(code, env, render);
      const snippet = render(`\`\`\`html\n${code}\n\`\`\``, env).trim();
      return `${preview}\n${snippet}`;
    },
  );
};
