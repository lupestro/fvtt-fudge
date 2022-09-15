import gulp from "gulp";

import * as javascript from "./build/javascript.mjs";
import * as packs from "./build/packs.mjs";

//export default gulp.series(
//  gulp.parallel(css.compile),
//  css.watchUpdates
//);
  
// CSS compiling
//export const buildCSS = gulp.series(css.compile);

// Javascript compiling & linting
export const buildJS = gulp.series(javascript.compile);
export const lint = gulp.series(javascript.lint);

// Compendium pack management
export const cleanPacks = gulp.series(packs.clean);
export const compilePacks = gulp.series(packs.compile);
export const extractPacks = gulp.series(packs.extract);

// Build all artifacts
export const buildAll = gulp.parallel(
  //css.compile,
  javascript.compile,
  packs.compile
);