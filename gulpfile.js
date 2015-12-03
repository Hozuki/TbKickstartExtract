/**
 * Created by MIC on 2015/12/1.
 */

var gulp = require("gulp");
var ts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");

var tsConfig = {
    target: "es5",
    module: "commonjs",
    noImplicitAny: true,
    noEmitOnError: true
};

gulp.task("build", function () {
    var tsResult =
        gulp.src(["page/**/*.ts", "scripts/inc/**/*.d.ts"])
            //.pipe(sourcemaps.init())
            .pipe(ts(tsConfig));
    return tsResult.js
        //.pipe(sourcemaps.write("."))
        .pipe(gulp.dest("page"));
});
