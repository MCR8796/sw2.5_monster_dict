import webview
from server import app as server

def on_closing():
    return True

if __name__ == "__main__":
    window = webview.create_window("SW2.5 魔物辞書", server, width=900, height=1200)
    window.events.closing += on_closing
    webview.start(debug=False)