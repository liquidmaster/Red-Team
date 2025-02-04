Root Detection & SSL Bypass Script
This repository contains a Frida script for bypassing root detection and SSL certificate pinning in Android applications.

Technical Implementation
The script utilizes Frida's powerful JavaScript injection capabilities to bypass both root detection and SSL certificate pinning in Android applications. It works by intercepting and modifying the application's root detection methods and SSL/TLS certificate validation logic at runtime. The implementation hooks into key Java classes responsible for root detection (Runtime.exec, File operations, PackageManager) and SSL certificate validation (SSLContext, TrustManager).

When the application attempts to detect root access, the script intercepts these attempts through various methods:

Blocking common root binary path checks
Intercepting shell commands that check for root
Preventing detection of root-related packages
Implementing caching for better performance
Prerequisites
Frida installed on your system
Rooted Android device or emulator
Burp Suite for SSL interception
ADB (Android Debug Bridge)
Setup Instructions
1. SSL Certificate Setup
Export Burp Suite's CA certificate:

Open Burp Suite
Go to Proxy -> Options -> TLS
Click on Export CA certificate
Choose Certificate in DER format
Save it as burp.crt
Alternative certificate formats and conversions:

# Convert PEM to DER format
openssl x509 -in certificate.pem -outform DER -out burp.crt

# Convert CER to DER format
openssl x509 -in certificate.cer -outform DER -out burp.crt

# Convert P12 to DER format
openssl pkcs12 -in certificate.p12 -nodes -out temp.pem
openssl x509 -in temp.pem -outform DER -out burp.crt
rm temp.pem
Verify the certificate format:

# Check certificate information
openssl x509 -in burp.crt -inform DER -text -noout
Push the certificate to the device:

adb push burp.crt /data/local/tmp/burp.crt
adb shell "chmod 644 /data/local/tmp/burp.crt"
Note: The certificate should be in DER format and have the following characteristics:

File extension: .crt
Format: X.509
Encoding: DER (binary)
Location on device: /data/local/tmp/burp.crt
Permissions: 644 (readable by all)
2. Frida Setup
Install Frida on your host machine:

pip install frida-tools
Push frida-server to your device:

# Download appropriate frida-server version from GitHub
adb push frida-server /data/local/tmp/
adb shell "chmod 755 /data/local/tmp/frida-server"
Start frida-server on device:

adb shell "/data/local/tmp/frida-server &"
3. Running the Script
Save the script as root_bypass.js

Run the script with Frida:

frida -U -l root_bypass.js -f com.target.application
Replace com.target.application with your target app's package name.

Features
The script provides comprehensive bypass functionality:

Root Detection Bypass:
Blocks su binary checks
Prevents root package detection
Intercepts shell commands
Caches results for better performance
SSL Pinning Bypass:
Implements custom TrustManager
Allows Burp Suite to intercept HTTPS traffic
Handles certificate validation
Troubleshooting
If you encounter issues:

Check if Frida server is running:

adb shell ps | grep frida
Verify certificate placement:

adb shell "ls -l /data/local/tmp/burp.crt"
Check logcat for any error messages:

adb logcat | grep frida
Example Output
When the script is running successfully, you should see output similar to this:

Image

This output indicates:

Successful SSL certificate setup with PortSwigger CA
Root detection bypass implementation
Multiple SSL Context hooks and custom TrustManager initializations
Blocked attempts to detect root access through file checks and commands
Security Notice
This tool is designed strictly for legitimate security research, penetration testing, and vulnerability assessment purposes. Using this tool to bypass root detection or SSL pinning without explicit authorization may violate applicable laws, terms of service, or privacy regulations. Security researchers should obtain proper permission before testing any application and respect responsible disclosure practices. The ability to bypass security controls carries significant ethical responsibilities. Never use this tool on applications or systems without proper authorization from the system owner. The authors of this tool are not responsible for any misuse or damage caused by using this bypass script. Always ensure compliance with relevant laws, regulations, and ethical guidelines when conducting security research.