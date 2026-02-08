import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: [
        "./src/app.js",
    ],
    bundle: true,
    outfile: "public/assets/app.bundle.js",
    logLevel: "info"
})
