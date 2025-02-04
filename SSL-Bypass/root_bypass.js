setTimeout(function() {
    Java.perform(function() {
        console.log("[.] Starting Advanced Root Detection & SSL Bypass");

        const ROOT_FILES = [
            "/system/app/Superuser.apk",
            "/system/xbin/su",
            "/system/bin/su",
            "/sbin/su",
            "/system/su",
            "/system/bin/.ext/.su",
            "/system/xbin/mu"
        ];

        const ROOT_PACKAGES = [
            "com.noshufou.android.su",
            "com.thirdparty.superuser",
            "eu.chainfire.supersu",
            "com.topjohnwu.magisk"
        ];

        const execCommandCache = new Set();
        const filePathCache = new Set();

        const JavaClasses = {
            CertificateFactory: Java.use("java.security.cert.CertificateFactory"),
            FileInputStream: Java.use("java.io.FileInputStream"),
            BufferedInputStream: Java.use("java.io.BufferedInputStream"),
            X509Certificate: Java.use("java.security.cert.X509Certificate"),
            KeyStore: Java.use("java.security.KeyStore"),
            TrustManagerFactory: Java.use("javax.net.ssl.TrustManagerFactory"),
            SSLContext: Java.use("javax.net.ssl.SSLContext"),
            Runtime: Java.use("java.lang.Runtime"),
            File: Java.use("java.io.File"),
            PackageManager: Java.use("android.app.ApplicationPackageManager"),
            NameNotFoundException: Java.use("android.content.pm.PackageManager$NameNotFoundException")
        };

        try {
            function setupSSLBypass() {
                console.log("[+] Setting up SSL bypass...");
                
                const cf = JavaClasses.CertificateFactory.getInstance("X.509");
                const fileInputStream = JavaClasses.FileInputStream.$new("/data/local/tmp/burp.crt");
                const bufferedInputStream = JavaClasses.BufferedInputStream.$new(fileInputStream);
                const ca = cf.generateCertificate(bufferedInputStream);
                bufferedInputStream.close();

                const certInfo = Java.cast(ca, JavaClasses.X509Certificate);
                console.log("[o] CA Info: " + certInfo.getSubjectDN());

                const keyStoreType = JavaClasses.KeyStore.getDefaultType();
                const keyStore = JavaClasses.KeyStore.getInstance(keyStoreType);
                keyStore.load(null, null);
                keyStore.setCertificateEntry("ca", ca);

                const tmfAlgorithm = JavaClasses.TrustManagerFactory.getDefaultAlgorithm();
                const tmf = JavaClasses.TrustManagerFactory.getInstance(tmfAlgorithm);
                tmf.init(keyStore);

                JavaClasses.SSLContext.init.overload(
                    "[Ljavax.net.ssl.KeyManager;", 
                    "[Ljavax.net.ssl.TrustManager;", 
                    "java.security.SecureRandom"
                ).implementation = function(a, b, c) {
                    console.log("[o] SSLContext.init() hooked");
                    this.init.call(this, a, tmf.getTrustManagers(), c);
                    console.log("[+] SSLContext initialized with custom TrustManager");
                };
            }

            function setupRootBypass() {
                console.log("[+] Setting up root detection bypass...");
                
                JavaClasses.Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
                    if (execCommandCache.has(cmd)) {
                        console.log("[+] Cache hit: " + cmd);
                        return null;
                    }
                    
                    if (cmd.includes("su") || cmd.includes("which") || cmd.includes("busybox")) {
                        execCommandCache.add(cmd);
                        console.log("[+] Blocked root check command: " + cmd);
                        return null;
                    }
                    return this.exec(cmd);
                };

                JavaClasses.File.exists.implementation = function() {
                    const path = this.getAbsolutePath();
                    
                    if (filePathCache.has(path)) {
                        return false;
                    }

                    if (ROOT_FILES.some(rootPath => path.includes(rootPath))) {
                        filePathCache.add(path);
                        console.log("[+] Blocked root file check: " + path);
                        return false;
                    }
                    return this.exists();
                };

                JavaClasses.PackageManager.getPackageInfo.overload('java.lang.String', 'int')
                    .implementation = function(packageName, flags) {
                    if (ROOT_PACKAGES.includes(packageName)) {
                        console.log("[+] Blocked root package check: " + packageName);
                        throw JavaClasses.NameNotFoundException.$new();
                    }
                    return this.getPackageInfo(packageName, flags);
                };
            }

            setupSSLBypass();
            setupRootBypass();
            console.log("[+] All bypasses successfully implemented");

        } catch(err) {
            console.error("[!] Setup failed:");
            console.error(err.stack);
        }
    });
}, 0); 