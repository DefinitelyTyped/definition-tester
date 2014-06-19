module.exports = function (grunt) {
	'use strict';

	require('source-map-support').install();

	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-ts-clean');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: grunt.util._.extend(grunt.file.readJSON('.jshintrc'), {
				reporter: './node_modules/jshint-path-reporter'
			}),
			support: {
				options: {
					node: true
				},
				src: ['Gruntfile.js']
			}
		},
		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json'),
				formatter: 'tslint-path-formatter'
			},
			src: ['src/**/*.ts'],
			test: ['test/src/**/*.ts']
		},
		ts_clean: {
			dist: {
				options: {
					verbose: false
				},
				src: ['dist/**/*', '!dist/index.d.ts'],
				dot: true
			}
		},
		clean: {
			cruft: [
				'tscommand-*.tmp.txt',
				'dist/.baseDir*'
			],
			dist: [
				'dist/**/*'
			],
			tmp: [
				'tmp/**/*'
			],
			test: [
				'test/tmp/**/*'
			]
		},
		ts: {
			options: {
				fast: 'never',
				target: 'es5',
				module: 'commonjs',
				sourcemap: true,
				declaration: true,
				comments: true,
				verbose: true
			},
			build: {
				options: {
					noImplicitAny: true
				},
				src: ['src/index.ts'],
				outDir: 'dist/'
			}
		}
	});

	grunt.registerTask('prep', [
		'clean:tmp',
		'clean:dist',
		'clean:cruft',
		'jshint:support'
	]);

	grunt.registerTask('compile', [
		'prep',
		'ts:build',
		'tslint:src'
	]);

	grunt.registerTask('build', [
		'compile',
		'sweep'
	]);

	grunt.registerTask('test', [
		'build'
	]);

	grunt.registerTask('prepublish', [
		'build',
		'ts_clean:dist'
	]);

	grunt.registerTask('sweep', [
		'clean:cruft',
		'clean:tmp',
		'clean:test'
	]);

	grunt.registerTask('dev', ['ts:typings']);
	grunt.registerTask('debug', ['build']);

	grunt.registerTask('default', ['build']);
};
