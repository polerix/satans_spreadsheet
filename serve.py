import http.server
import socketserver
import webbrowser

PORT = 6660

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    print(f"Opening browser to http://localhost:{PORT}/index.html")
    webbrowser.open(f"http://localhost:{PORT}/index.html")
    httpd.serve_forever()
