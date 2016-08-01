module.exports = function (grunt) {
	'use strict';

	require('source-map-support').install();

	var path = require('path');
	var childProcess = require('child_process');

	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json'),
				rulesDirectory: "src/lint/customRules"
			},
			src: ['src/**/*.ts'],
			test: ['test/src/**/*.ts']
		},
		clean: {
			cruft: [
				'tscommand-*.tmp.txt'
			],
			dist: [
				'src/**/*.js',
				'src/**/*.js.map',
				'src/**/*.d.ts',
			],
			tmp: {
				dot: true,
				src: [
					'tmp/'
				]
			},
			test: [
				'test/tmp/**/*'
			]
		},
		ts: {
			default: {
				tsconfig: {
					tsconfig: "./tsconfig.json",
					updateFiles:false
				}
			}
		},
		exec: {
			test: {
				options: {
					full: (process.env.TRAVIS === 'true')
				}
			}
		}
	});

	grunt.registerMultiTask('exec', function () {
		var options = this.options({
			full: true
		});
		var done = this.async();

		var run = function (target) {
			var args = [];
			args.push(path.resolve(__dirname, 'src', 'index.js'));
			if (options.tests) {
				args.push('--tests');
			}
			if (options.lint) {
				args.push('--lint');
			}
			if (options.changes) {
				args.push('--changes');
			}
			if (options.debug) {
				args.push('--debug');
			}
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

		if (!options.full) {
			// TODO prepare shrinked DT repo
			void 0;
		}

		var fs = require('fs');
		var repoDir = path.join(__dirname, 'tmp');
		fs.mkdirSync(repoDir);

		console.log('cloning repos..');
		childProcess.exec(`git clone --depth 20 https://github.com/DefinitelyTyped/DefinitelyTyped ${repoDir}`, (err, stdout, stderr) => {
			console.log(stdout);
			console.error(stderr);
			if (err) {
				done(err);
			}
			else {
				run(repoDir);
			}
		});
		run(repoDir);
	});

	grunt.registerTask('dev', [
		'prep',
		'ts',
		'exec'
	]);

	grunt.registerTask('run', [
		'clean:tmp',
		'exec'
	]);

	grunt.registerTask('prep', [
		'clean:tmp',
		'clean:dist',
		'clean:cruft'
	]);

	grunt.registerTask('compile', [
		'prep',
		'ts',
		'tslint:src'
	]);

	grunt.registerTask('build', [
		'compile',
		'sweep'
	]);

	grunt.registerTask('test', [
		'build',
		'exec'
	]);

	grunt.registerTask('prepublish', [
		'build'
	]);

	grunt.registerTask('sweep', [
		'clean:cruft',
		'clean:tmp',
		'clean:test'
	]);

	grunt.registerTask('debug', ['build']);

	grunt.registerTask('default', ['build']);
};
