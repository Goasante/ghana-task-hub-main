#!/usr/bin/env python3
"""
Simple Python HTTP Server for Ghana Task Hub Frontend
Run this after building the frontend with: npm run build
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

def serve_frontend():
    # Check if dist directory exists
    dist_path = Path("dist")
    if not dist_path.exists():
        print("❌ Error: 'dist' directory not found!")
        print("Please build the frontend first by running: npm run build")
        sys.exit(1)
    
    # Change to dist directory
    os.chdir(dist_path)
    
    PORT = 5500
    
    class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            # Add CORS headers
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            super().end_headers()
        
        def do_OPTIONS(self):
            self.send_response(200)
            self.end_headers()
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("🇬🇭 Ghana Task Hub Frontend Server")
        print("==================================")
        print(f"🚀 Frontend running on: http://localhost:{PORT}")
        print(f"📁 Serving from: {dist_path.absolute()}")
        print("==================================")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped!")

if __name__ == "__main__":
    serve_frontend()

