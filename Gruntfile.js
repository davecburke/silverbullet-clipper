module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Template task configuration.
        template: {
            /* CHROME */
            // manifest.json
            chrome_manifest_json: {
                options: {
                    data: {
                        taskName: 'chrome',
                        manifestVersion: 3,
                        background: '"service_worker": "js/service-worker.js"',
                        permissions: '["activeTab", "scripting","storage","offscreen"]',
                        hostPermissions: '"host_permissions": ["*://*/*"]'
                    
                    }
                },
                files: {
                    'dist/chrome/manifest.json': ['src/manifest.template.json'],
                }
            },
            // popup.html
            chrome_popup_html: {
                options: {
                    data: {
                        taskName: 'chrome',
                    }
                },
                files: {
                    'dist/chrome/html/popup.html': ['src/html/popup.template.html'],                
                }
            },
            // popup.js
            chrome_popup_offscreen_js: {
                options: {
                    data: {
                        runTime: 'chrome',
                    }
                },
                files: {
                    'dist/chrome/js/popup.js': ['src/js/popup.template.js'], 
                    'dist/chrome/js/offscreen.js': ['src/js/offscreen.template.js'],                
                }
            },
            // service-worker.js
            chrome_service_worker_js: {
                options: {
                    data: {
                        taskName: 'chrome',
                        runTime: 'chrome',
                    }
                },
                files: {
                    'dist/chrome/js/service-worker.js': ['src/js/service-worker.template.js'],
                } 
            },
            /* FIREFOX */
            // manifest.json
            firefox_manifest_json: {
                options: {
                    data: {
                        taskName: 'firefox',
                        manifestVersion: 2,
                        action: 'browser_',
                        background: '"scripts": ["js/service-worker.js"]',
                        permissions: '["<all_urls>","activeTab","storage"]',
                        browserSpecificSettings: '"browser_specific_settings": {"gecko": {"id": "silverbullet-clipper@burke.ext","strict_min_version": "42.0"}}'
                    }
                },
                files: {
                    'dist/firefox/manifest.json': ['src/manifest.template.json'],                }
            },
            // popup.html
            firefox_popup_html: {
                options: {
                    data: {
                        taskName: 'firefox',
                        offScreen: '<script src="../js/offscreen.js" type="module"></script>',
                    }
                },
                files: {
                    'dist/firefox/html/popup.html': ['src/html/popup.template.html'],                
                }
            },
            // popup.js
            firefox_popup_offscreen_js: {
                options: {
                    data: {
                        runTime: 'browser',
                    }
                },
                files: {
                    'dist/firefox/js/popup.js': ['src/js/popup.template.js'],
                    'dist/firefox/js/offscreen.js': ['src/js/offscreen.template.js']                
                }
            },
            // service-worker.js
            firefox_service_worker_js: {
                options: {
                    data: {
                        taskName: 'firefox',
                        runTime: 'browser',
                    }
                },
                files: {
                    'dist/firefox/js/service-worker.js': ['src/js/service-worker.template.js'],
                } 
            }
        },
        // Copy shared files
        copy: {
            shared_files: {
                files: [
                    // Copy shared files
                    {expand: true, src: ['src/css/**'], dest: 'dist/chrome/css/', flatten: true, filter: 'isFile'},
                    {expand: true, src: ['src/css/**'], dest: 'dist/firefox/css', flatten: true, filter: 'isFile'},
                    {expand: true, src: ['src/images/**'], dest: 'dist/chrome/images/', flatten: true, filter: 'isFile'},
                    {expand: true, src: ['src/images/**'], dest: 'dist/firefox/images', flatten: true, filter: 'isFile'},
                    {expand: true, src: ['src/js/turndown.js'], dest: 'dist/chrome/js', flatten: true, filter: 'isFile'},
                    {expand: true, src: ['src/js/turndown.js'], dest: 'dist/firefox/js', flatten: true, filter: 'isFile'}
                ] 
            },
            chrome_files: {
                files: [
                    {expand: true, src: ['src/html/offscreen.html'], dest: 'dist/chrome/html', flatten: true, filter: 'isFile'},
                ] 
            }
        },
    });
    // Load the plugin.
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // Register tasks.
    grunt.registerTask('build:chrome', ['template:chrome_manifest_json','template:chrome_popup_html','template:chrome_popup_offscreen_js','template:chrome_service_worker_js','copy:shared_files','copy:chrome_files']);
    grunt.registerTask('build:firefox', ['template:firefox_manifest_json','template:firefox_popup_html','template:firefox_popup_offscreen_js','template:firefox_service_worker_js','copy:shared_files']);
};