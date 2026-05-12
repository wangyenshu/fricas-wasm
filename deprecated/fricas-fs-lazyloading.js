self.Module = self.Module || {};
self.Module.preRun = self.Module.preRun || [];

self.Module.preRun.push(function() {
    addRunDependency('fricas_fs_init');

    async function initFS() {
        try {
            FS.mkdirTree('/home/web_user');
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
                var fileName = parts.pop();
                
                var parentDir = '/fricas0' + (parts.length > 0 ? '/' + parts.join('/') : '');

                if (!createdDirs[parentDir]) {
                    FS.mkdirTree(parentDir);
                    createdDirs[parentDir] = true;
                }

                var fetchPath = 'fricas0/' + appPath.split('/').map(encodeURIComponent).join('/');
                
                FS.createLazyFile(parentDir, fileName, fetchPath, true, false);
            });

            removeRunDependency('fricas_fs_init');
        } catch(err) {
            console.error("Failed to initialize FriCAS FS:", err);
            removeRunDependency('fricas_fs_init');
        }
    }

    initFS();
});