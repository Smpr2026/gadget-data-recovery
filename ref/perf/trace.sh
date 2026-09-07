#!/bin/zsh
# Usage: trace.sh <variant> ; records ~6s of real-time rendering into /tmp/gdr-trace-<variant>.json
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
v=$1
rm -f /tmp/gdr-trace-$v.json
perl -e 'alarm 40; exec @ARGV' -- "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 --force-device-scale-factor=2 --user-data-dir=/tmp/gdr-chrome-trace-$v --trace-startup --trace-startup-duration=7 --trace-startup-format=json --trace-startup-file=/tmp/gdr-trace-$v.json "--trace-startup-categories=disabled-by-default-devtools.timeline,blink,cc,viz" "http://127.0.0.1:8765/ref/perf/$v.html" >/dev/null 2>&1
ls -la /tmp/gdr-trace-$v.json 2>/dev/null | awk '{print $5, $9}'
