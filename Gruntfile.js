module.exports = function (grunt) {
	'use strict';

	require('source-map-support').install();

	var path = require('path');
	var childProcess = require('child_process');

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
				src: ['dist/**/*'],
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
			tmp: {
				dot: true,
				src: [
				'tmp/**/*'
				]
			},
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
		},
		exec: {
			options: {
				full: (process.env.TRAVIS === 'true')
			}
		}
	});

	grunt.registerTask('exec', function () {
		var options = this.options({
			full: false
		});
		var done = this.async();

		var run = function (target) {
			var args = [];
			args.push(path.resolve(__dirname, 'dist', 'index.js'));
			if (!options.full) {
				args.push('--skip-tests');
			}
			args.push('--debug');
			args.push('--path', target);
			var opts = {
				cwd: target,
				stdio: 'inherit'
			};
			childProcess.spawn('node', args, opts).on('close', function (code) {
				console.log('child process exited with code ' + code);
				done((code === 0));
			});
		};

		if (options.full) {
			var fs = require('fs');
			fs.mkdirSync('tmp');

			var Git = require('git-wrapper');
			var git = new Git({
				'git-dir': 'tmp/.git'
			});
			var opts = {
				depth: 20
			};
			var args = [
				'https://github.com/borisyankov/DefinitelyTyped',
				'tmp'
			];
			console.log('cloning repos..');

			git.exec('clone', opts, args, function (err, msg) {
				console.log(msg);
				if (err) {
					done(err);
				}
				else {
					run(path.resolve(__dirname, 'tmp'));
				}
			});
		}
		else {
			run(path.resolve(__dirname, '..', 'DefinitelyTyped-alt'));
		}
	});

	grunt.registerTask('dev', [
		'prep',
		'ts:build',
		'exec'
	]);

	grunt.registerTask('run', [
		'clean:tmp',
		'exec'
	]);

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
		'sweep',
		'ts_clean:dist'
	]);

	grunt.registerTask('test', [
		'build',
		'exec'
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

	grunt.registerTask('debug', ['build']);

	grunt.registerTask('default', ['build']);
};
