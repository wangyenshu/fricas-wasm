self.Module = self.Module || {};
self.Module.preRun = self.Module.preRun || [];

self.Module.preRun.push(function() {
    addRunDependency('fricas_fs_init');

    async function initFS() {
        try {
            try { FS.mkdirTree('/home/web_user'); } catch(e) {}
            const startupScript = `
            ;; Trick FriCAS into skipping the compiler check
            (provide :cmp)
            (provide "cmp")
            
            ;; Mock the missing C package symbol so the Lisp Reader doesn't crash
            (unless (find-package "C") (make-package "C"))
            (intern "BUILD-PROGRAM" "C")
            (export (find-symbol "BUILD-PROGRAM" "C") "C")
            
            ;; Boot FriCAS
            (ext:chdir "/fricas0")
            (load "fricas")
            `;
            FS.writeFile('/home/web_user/.eclrc', startupScript);

            const mapRes = await fetch('fricas-fs.json');
            const fileList = await mapRes.json();

            var createdDirs = {};
            fileList.forEach(function(appPath) {
                var parts = appPath.split('/');
                parts.pop();
                var parentDir = '/fricas0' + (parts.length > 0 ? '/' + parts.join('/') : '');

                if (!createdDirs[parentDir]) {
                    try { FS.mkdirTree(parentDir); } catch(e) {}
                    createdDirs[parentDir] = true;
                }
            });

            try { FS.mkdirTree('/fricas_idb_cache'); } catch(e) {}
            FS.mount(IDBFS, {}, '/fricas_idb_cache');

            FS.syncfs(true, async function(err) {
                if (err) console.warn("IDBFS sync read error:", err);

                fileList.forEach(function(appPath) {
                    var parts = appPath.split('/');
                    parts.pop();
                    var parentDir = '/fricas_idb_cache' + (parts.length > 0 ? '/' + parts.join('/') : '');
                    try { FS.mkdirTree(parentDir); } catch(e) {}
                });

                var needsSave = false;

                var fetchPromises = fileList.map(async function(appPath) {
                    var fetchPath = 'fricas0/' + appPath.split('/').map(encodeURIComponent).join('/');
                    var idbfsPath = '/fricas_idb_cache/' + appPath;
                    var finalAppPath = '/fricas0/' + appPath;

                    try {
                        FS.stat(idbfsPath);
                        FS.writeFile(finalAppPath, FS.readFile(idbfsPath));
                    } catch (e) {
                        try {
                            const response = await fetch(fetchPath);
                            if (response.ok) {
                                const buffer = await response.arrayBuffer();
                                const data = new Uint8Array(buffer);
                                FS.writeFile(finalAppPath, data);
                                FS.writeFile(idbfsPath, data);
                                needsSave = true;
                            } else {
                                console.error("Failed to fetch:", fetchPath);
                            }
                        } catch (fetchErr) {
                            console.error("Network error on:", fetchPath);
                        }
                    }
                });

                await Promise.all(fetchPromises);

                if (needsSave) {
                    FS.syncfs(false, function(saveErr) {
                        if (saveErr) console.warn("IDBFS sync write error:", saveErr);
                        removeRunDependency('fricas_fs_init');
                    });
                } else {
                    removeRunDependency('fricas_fs_init');
                }
            });

        } catch(err) {
            console.error("Failed to initialize FriCAS FS:", err);
            removeRunDependency('fricas_fs_init');
        }
    }

    initFS();
});