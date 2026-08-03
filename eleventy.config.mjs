import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import { bundle } from "lightningcss";
import litPlugin from "@lit-labs/eleventy-plugin-lit";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

const isProd = process.env.ELEVENTY_RUN_MODE === "build";
const esbuildOpts = {
  bundle: true,
  format: "esm",
  target: "esnext",
  minify: isProd,
  sourcemap: !isProd,
};

const now = () => {
  const now = new Date();
  return {
    raw: now,
    iso: now.toISOString(),
    formatted: new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(now),
  };
};

/**
 * e.g. "/03-Server_side_rendering.md" -> "Server side rendering"
 *
 * @param {string} filePath
 */
const getLabel = (filePath) => {
  if (!filePath) return "";
  const fileName = filePath.split("/").pop();
  return fileName
    .replace(/^\d+-/, "")
    .replace(/\.md$/, "")
    .replace(/[_-]/g, " ");
};

/**
 * e.g. "/04-Base/10-Dialog.md" -> "/base/dialog/"
 * e.g. "/05-Material_You_expressive/10-Dialog.md" -> "/m3/dialog/"
 *
 * @param {string} filePath
 */
const getPermalink = (filePath) => {
  if (!filePath) return "";

  const segments = filePath
    .split("/")
    .map((seg) => seg.replace(/^\d+-/, "").replace(/_/g, "-").toLowerCase());

  let result = segments
    .join("/")
    .replace(/\.md$/, "")
    .replace("material-you-expressive", "m3")
    .replace("windows-98", "win98");

  if (result.endsWith("/overview")) result = result.replace(/\/overview$/, "");
  if (!result.startsWith("/") && result !== "") result = `/${result}`;

  return `${result}/`;
};

const bundleClientAssets = async () => {
  console.log("[seele-docs-skeleton] Bundling client assets");

  fs.mkdirSync("_site/client", { recursive: true });

  const componentEntryPoints = fs
    .globSync([
      "node_modules/@vollowx/seele/src/m3/*/*.js",
      "node_modules/@vollowx/seele/src/win98/*/*.js",
    ])
    .filter((path) => !path.endsWith(".css.js"));

  await Promise.all([
    esbuild.build({
      ...esbuildOpts,
      entryPoints: componentEntryPoints,
      outbase: "node_modules/@vollowx/seele/src",
      outdir: "_site/client",
      splitting: true,
    }),
    esbuild.build({
      ...esbuildOpts,
      entryPoints: ["./src/client.ts"],
      outfile: "_site/client/main.js",
    }),
    esbuild.build({
      ...esbuildOpts,
      entryPoints: ["src/lit-hydrate-support.ts"],
      outfile: "_site/client/lit-hydrate-support.js",
      minify: true,
      sourcemap: false,
      splitting: false,
    }),
    (async () => {
      const { code, map } = bundle({
        filename: path.resolve("src/client.css"),
        minify: isProd,
        sourceMap: !isProd,
      });
      fs.writeFileSync("_site/client/main.css", code);
      if (map) fs.writeFileSync("_site/client/main.css.map", map);
    })(),
  ]);
};

const bundleSSRAssets = async () => {
  console.log("[seele-docs-skeleton] Bundling SSR assets");

  fs.mkdirSync("_temp", { recursive: true });

  await esbuild.build({
    ...esbuildOpts,
    entryPoints: ["src/ssr-entrypoint.ts"],
    outfile: "_temp/ssr-entrypoint.js",
    platform: "node",
    minify: false,
    sourcemap: false,
  });
};

const processMarkdown = (eleventyConfig) => {
  const md = markdownIt({ html: true, linkify: true }).use(
    markdownItAnchor,
    {},
  );

  // `<!-- @show -->`
  const defaultRender = md.render.bind(md);
  md.render = (src, env) => {
    if (src) {
      src = src.replace(
        /<!--\s*@show\s*-->\s*```html\r?\n([\s\S]*?)\r?\n```/gi,
        (_, code) => `${code}\n\n\`\`\`html\n${code}\n\`\`\``,
      );
    }
    return defaultRender(src, env);
  };

  const defaultLinkRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const hrefIdx = tokens[idx].attrIndex("href");
    if (hrefIdx >= 0) {
      let href = tokens[idx].attrs[hrefIdx][1];

      if (env?.references && href) {
        const refKey = md.utils
          ? md.utils.normalizeReference(href)
          : href.trim().toUpperCase();
        if (env.references[refKey]) {
          href = env.references[refKey].href;
        }
      }

      const isExternal =
        /^[a-z][a-z0-9+.-]*:/i.test(href) ||
        href.startsWith("//") ||
        href.startsWith("#");

      // Match relative and root-relative markdown (.md) links
      if (!isExternal && href.includes(".md")) {
        const [linkPath, hash] = href.split("#");
        const currentFileDir = env.page?.filePathStem
          ? path.posix.dirname(env.page.filePathStem)
          : "/";

        // Resolve target path relative to current document stem
        const resolvedPath = href.startsWith("/")
          ? linkPath
          : path.posix.resolve(currentFileDir, linkPath);

        const cleanUrl = getPermalink(resolvedPath);
        href = cleanUrl + (hash ? `#${hash}` : "");
      }

      tokens[idx].attrs[hrefIdx][1] = href;
    }
    return defaultLinkRender(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addTransform("uncomment", function (content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      // e.g. `<!-- @uncomment <code> -->` -> `<code>`
      return content.replace(/<!--\s*@uncomment\s+([\s\S]*?)\s*-->/gi, "$1");
    }
    return content;
  });
};

export default async function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", async () => {
    if (isProd) fs.rmSync("_site", { recursive: true, force: true });
    await bundleClientAssets();
  });
  if (isProd) {
    await bundleSSRAssets();
    eleventyConfig.addPlugin(litPlugin, {
      mode: "worker",
      componentModules: ["_temp/ssr-entrypoint.js"],
    });
    eleventyConfig.on("eleventy.after", () => {
      fs.rmSync("_temp", { recursive: true, force: true });
    });
  }

  eleventyConfig.addWatchTarget("./src/");
  eleventyConfig.addPassthroughCopy("seele/docs/**/*.png");
  eleventyConfig.addPassthroughCopy("seele/docs/**/*.svg");

  eleventyConfig.addGlobalData("buildTime", now());
  eleventyConfig.addGlobalData("layout", "base.njk");
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      const stem = data.page.filePathStem;
      if (!stem) return;
      return getPermalink(stem) + "index.html";
    },
    label: (data) => {
      const stem = data.page.filePathStem;
      if (!stem) return "";
      return getLabel(stem);
    },
  });

  processMarkdown(eleventyConfig);
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.setServerOptions({ port: 22331 });

  return {
    dir: {
      input: "docs",
      includes: "../_includes",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
