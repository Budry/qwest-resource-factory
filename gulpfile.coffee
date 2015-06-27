# This file is part of the KappaJs resource factory package.
# (c) Ondřej Záruba <zarubaondra@gmail.com>
#
# For the full copyright and license information, please view
# the license.md file that was distributed with this source code.

gulp = require "gulp"
coffee = require "gulp-coffee"

gulp.task "default", ->
  gulp.src "src/qwest-resource-factory.coffee"
  .pipe coffee()
  .pipe gulp.dest "dist/"