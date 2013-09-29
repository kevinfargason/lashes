
/* eBuisness mobile build script
 * 
 * This is the file which controls front-end build tasks.
 * It reads JSON config data from package.json
 *
 * @author Kevin Fargason
 * @author Richard Qin
 *     -- added support for pre-compiling handlebars templates
 *     -- split jshint for dev and prod, add more jshint options, lint before concat
 *     -- fork gruntfile.js into gruntfile.prod.js (for prod) and gruntfile.js (for dev)
 *     -- simplify gruntfile.js (for dev)
 * 
 * @help See grunt.readme.txt
 */

module.exports = function(grunt) {

  //These tasks will run by simplying executing "grunt" on the command line - ideal for local dev
  //grunt.defaultTasks = ['handlebars', 'jshint', 'concat', 'closure_wrap', 'rsync', 'jasmine'];
  grunt.defaultTasks = [];
  grunt.bluepayTasks = [
    // "less:bluepay", 
    // "jshint:bluepay", 
    // "uglify:bluepay", 
    // "rsync:bluepayImg",
    //"rsync:bluepayFont",
    // "compress:bluepay"
    ];

  // Load up the node packages for the tasks we are gonna do
  grunt.loadNpmTasks('grunt-contrib-less'); // compile less to css  
  grunt.loadNpmTasks('grunt-contrib-concat'); // slap some files together
  grunt.loadNpmTasks('grunt-contrib-jshint'); // this will review your javascript for best practices, and hurt your feelings
  grunt.loadNpmTasks('grunt-contrib-uglify'); // squeeze, mangle, etc your javascript
  //grunt.loadNpmTasks('grunt-contrib-compress'); // teeny-tiny files for the webserver to serve up
  grunt.loadNpmTasks('grunt-contrib-watch');  // actively grunt on filesystem change (dev workflow boost)
  grunt.loadNpmTasks('grunt-contrib-jasmine');// unit tests
  grunt.loadNpmTasks('grunt-rsync');          // deploy images to dist folder

  grunt.initConfig({
    //read in the package.json file and store it
    pkg: grunt.file.readJSON('package.json'),
    bp: grunt.file.readJSON('grunt.bluepay.config'),

    less:{
      jqueryMobile:{
        src: [
          '<%= pkg.pathto.root %><%= pkg.pathto.jqueryStucture %>jquery.mobile.structure.less',
          '<%= pkg.pathto.root %><%= pkg.pathto.jqueryTheme %>wm/jquery.mobile.less'
        ],
        dest: '<%= pkg.pathto.root %><%= pkg.pathto.buildhere %>css/jquery.mobile.css'
      },
      common:{
        src: [
          "<%= pkg.pathto.root %>less/payload.less"
        ],
        dest: "<%= pkg.pathto.root %>/dist/css/eBusiness.css"
      },
      bluepay:{
        options: {
          report: 'min',
          compress: true,
        },
        src: [
          "<%= bp.pathto.src.less %>/_payload.less"
        ],
        dest: "<%= bp.pathto.dist.css %>/mobile-billpay-bluepay.min.css"
      }
    },

    uglify:{
      bluepay:{
        options: {
          mangle: false,
          compress: false,
          beautify: true,
          preserveComments: "none",
          report: "min"
        },
        src: [
          "<%= bp.pathto.src.js %>/fontdeck.js",
          "<%= bp.pathto.src.js %>/vendor/zepto.js",
          "<%= bp.pathto.src.js %>/vendor/zepto.touch.js",
          "<%= bp.pathto.src.js %>/vendor/zepto.slide.js",
          "<%= bp.pathto.src.js %>/vendor/happy.js",
          "<%= bp.pathto.src.js %>/vendor/mbp.helper.js",
          "<%= bp.pathto.src.js %>/vendor/mbp.utils.js",
          "<%= bp.pathto.src.js %>/vendor/jquery.payment.js",
          "<%= bp.pathto.src.js %>/wm.js",
          "<%= bp.pathto.src.js %>/wm.mobile.js",
          "<%= bp.pathto.src.js %>/mobile.validation.js",
          "<%= bp.pathto.src.js %>/wm.mobile.page.js",
          "<%= bp.pathto.src.js %>/wm.mobile.utils.js",
          "<%= bp.pathto.src.js %>/mobile.bootstrap.js"

        ],
        dest: "<%= bp.pathto.dist.js %>/mobile-billpay-bluepay.min.js"
      }
    },

    compress: {
      bluepay: {
        options: {
          mode: 'gzip',
          pretty: true
        },
        expand: true,
        cwd: "<%= bp.pathto.dist.root %>/",
        src: ['**/*.js', '**/*.css'],
        dest: '<%= bp.pathto.dist.root %>/squished/'
      }
    },


    //concatenate some files into one file
  //   concat: {
  //       options: {
  //         separator: ';' //add a ; between each file (just in case)
  //       },
  //       thirdpartyJS: {
  //         src: [
  //           '<%= pkg.pathto.lib %>/jquery-1.8.2.js',
  //           '<%= pkg.pathto.js %>/config.js',
  //           '<%= pkg.pathto.lib %>/jquery.mobile-1.3.0.js',  
  //           '<%= pkg.pathto.lib %>/underscore.js',
  //           '<%= pkg.pathto.lib %>/handlebars-1.0.0-rc3.js',
  //           '<%= pkg.pathto.lib %>/backbone-0.9.10.js'
  //           ],
  //         dest: '<%= pkg.pathto.buildhere %>/js/lib.js'
  //       },
  //       thirdpartyCSS: {
  //         src: ['<%= pkg.pathto.lib %>/jquery.mobile-1.3.0.css'],
  //         dest: '<%= pkg.pathto.buildhere %>/css/lib.css'
  //       },
  //       flyingsaucerCSS: {
  //         src: [
  //           '<%= pkg.pathto.css %>/flyingsaucer.css',
  //           '<%= pkg.pathto.css %>/flyingsaucer-theme.min.css'
  //         ],
  //         dest: '<%= pkg.pathto.buildhere %>/css/flyingsaucer.css'
  //       },
  //       handlebars: {
  //         src: ['<%= pkg.pathto.js %>/handlebars/**/*.js'],
  //         dest: '<%= pkg.pathto.buildhere %>/js/wm.handlebars.js'
  //       },
  //       backboneMVC: {
  //         src: [
  //           // '<%= pkg.pathto.js %>/main.js', 
  //           '<%= pkg.pathto.js %>/model/**/*.js', 
  //           '<%= pkg.pathto.js %>/view/**/*.js', 
  //           '<%= pkg.pathto.js %>/controller/**/*.js'
  //         ],
  //         dest: '<%= pkg.pathto.buildhere %>/js/r.js'
  //       },
  //        unitTests:{
  //          src: '<%= pkg.pathto.unitTests %>/spec/**/*.js',
  //          dest:'<%= pkg.pathto.unitTests %>/flyingSaucerTests.js'
  //        }
  //   },

    // deploy images to dist folder
    rsync: {
      common:{
          src:  '<%= pkg.pathto.img %>/',
          dest: '<%= pkg.pathto.buildhere %>/img',
          recursive: true,
          exclude: ['*.svn', '*.DS_Store', '*.svn-base', 'entries', '*.db']
      },
      bluepayImg:{
          src:  '<%= bp.pathto.src.img %>/',
          dest: '<%= bp.pathto.dist.img %>/',
          recursive: true,
          exclude: ['*.svn', '*.DS_Store', '*.svn-base', 'entries', '*.db']
        },
      bluepayFont:{
          src:  '<%= bp.pathto.src.font %>/',
          dest: '<%= bp.pathto.dist.font %>/',
          recursive: true,
          exclude: ['*.svn', '*.DS_Store', '*.svn-base', 'entries', '*.db']
        } 
    },

  //   // RQ: need this task because we relaxed a few rules in jshint_dev
    jshint: {
      common:{
        options: {
          es5: true,        //only support ECMAScript 5 specific syntax (IE8 uses ECMAScript 4)
          eqeqeq: true,     // use '===' not '=='
          newcap: true,     // 'new Constructor()', not 'new someFunction()'
          noarg: true,      // no 'arguments.caller', 'arguments.callee'
          unused: true,     // catch leaks
          debug: true,      // don't complain about 'debugger'
          smarttabs: true,  // mix space and tab is ok
          expr: true,       // 'one && one.get()' is ok
          devel: true
        },
        gruntfile:  'gruntfile.js', // rule #1 - you shouldn't lint others until you have linted yourself.
        js:         '<%= pkg.pathto.js %>/**/*.js'
      },
      bluepay:{
        options: {
          es5: true,        //only support ECMAScript 5 specific syntax (IE8 uses ECMAScript 4)
          eqeqeq: true,     // use '===' not '=='
          newcap: true,     // 'new Constructor()', not 'new someFunction()'
          noarg: true,      // no 'arguments.caller', 'arguments.callee'
          unused: true,     // catch leaks
          debug: true,      // don't complain about 'debugger'
          smarttabs: true,  // mix space and tab is ok
          expr: true,       // 'one && one.get()' is ok
          devel: true
        },

        files:{
          gruntfile:  'gruntfile.js', // rule #1 - you shouldn't lint others until you have linted yourself.
          js:         [
            '<%= bp.pathto.src.js %>/**/*.js',
            '!<%= bp.pathto.src.js %>/vendor/**'
            ]
        }
      }
    },

  //   //Unit Tests
  //   jasmine: {
  //     // these are some basic sample unit tests for demo purposes
  //     //sample:{
  //     //  src:    '<%= pkg.pathto.unitTests %>/_sample/src/*.js',
  //     // options: {
  //     //    specs:  '<%= pkg.pathto.unitTests %>/_sample/spec/*.js'
  //     //  }
  //     //}

  //   },

  //   //auto build when running "grunt watch"
    watch: {
      common:{
        files: [
          //'<%= pkg.pathto.root %><%= pkg.pathto.less %>/**'
          // '<%= pkg.pathto.js %>/**',
          // '<%= pkg.pathto.img %>/**',
          // '<%= pkg.pathto.lib %>/**',
          // '<%= pkg.pathto.unitTest %>/scripts/**',
        ],
        tasks: grunt.defaultTasks
      },
    }

   });

  // kick off the default tasks
  grunt.registerTask('default', grunt.defaultTasks);

 };



/* @TODO - ideas for the future:
npm install grunt-contrib-livereload (autorefresh in browser after build - dev workflow boost)
npm install grunt-contrib-copy (for poor windows developers who dont have rsync - sadface.)
*/