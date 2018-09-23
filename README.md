# mjss

collection of packages for mjss

## quick setup for development

`yarn link-all` will link all packages to local package library (yarn link), in your project use `yarn link mjss && yarn link less2mjss`

`yarn watch` will run and watch all tests and transpile all typescript to ES6 code on change

`yarn test [--watchAll]` will run all test in watch mode

## TODO

fix Extend plugin's replace regex
improve Cleanup plugin -> try to move it to create phase ?