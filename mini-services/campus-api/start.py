#!/usr/bin/env python3
import uvicorn
import signal
import sys

def main():
    signal.signal(signal.SIGTERM, lambda s, f: None)
    signal.signal(signal.SIGINT, lambda s, f: sys.exit(0))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        timeout_keep_alive=120,
        log_level="info",
    )

if __name__ == "__main__":
    main()
