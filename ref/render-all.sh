#!/bin/zsh
# Renders every page at rest (?static) with headless Chrome, desktop width, into /tmp/gdr-final-*.png
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for p in index data-recovery board-repairs trade contact portal; do
  perl -e 'alarm 30; exec @ARGV' -- "$CH" --headless=new --disable-gpu --hide-scrollbars --user-data-dir=/tmp/gdr-chrome-final-$p --window-size=1440,2400 --virtual-time-budget=6000 --screenshot=/tmp/gdr-final-$p.png "http://127.0.0.1:8765/$p.html?static" >/dev/null 2>&1
  ls -la /tmp/gdr-final-$p.png 2>/dev/null | awk '{print $5, $9}'
done
