// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.36.0/mod.ts";
import { DESCRIPTION, VERSION, PROJECT, TAGS, SHORT_NAME } from '../mod_metadata.ts';

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: { 
        test: "dev"
    },
  },
 
  "mappings": {
     "https://deno.land/x/bearzsh_assertions@0.1.0/mod.ts": {
        name: "@bearz-sh/assertions",
        version: "0.1.0",
     }
  },

  package: {
    // package.json properties
    name: `@bearz-sh/${SHORT_NAME}`,
    version: VERSION,
    description: DESCRIPTION,
    license: "MIT",
    contributors: [{
        name: "bearz",
        "url": "https://bearz-sh.github.io/"
    }],
    repository: {
      type: "git",
      url: `git+https://github.com/bearz-sh/${PROJECT}.git`,
    },
    bugs: {
      url: `https://github.com/bearz-sh/${PROJECT}/issues`,
    },
    keywords: TAGS.concat(["fx", "bearz", "bearz-sh"]),
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE.md", "npm/LICENSE.md");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});