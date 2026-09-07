#!/usr/bin/env python3
"""Builds the single-file homepage (photos, CSS and JS inlined) for the Claude artifact and offline use.
Usage: python3 build.py  -> gadget-data-recovery-standalone.html + scratch artifact copy."""
import re,base64,sys,os
root=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(root,'index.html'),encoding='utf-8').read()
css=open(os.path.join(root,'assets/site.css'),encoding='utf-8').read()
s=s.replace('<link rel="stylesheet" href="assets/site.css">','<style>\n'+css+'\n</style>')
for js in ['site','home']:
    code=open(os.path.join(root,f'assets/{js}.js'),encoding='utf-8').read()
    s=s.replace(f'<script src="assets/{js}.js"></script>','<script>\n'+code+'\n</script>')
for n in ['board-labeled','scope-gold-ic','chip-reball','cpu-tweezers','scope-boards']:
    b=base64.b64encode(open(os.path.join(root,f'assets/{n}.jpg'),'rb').read()).decode()
    s=s.replace(f'assets/{n}.jpg',f'data:image/jpeg;base64,{b}')
png=base64.b64encode(open(os.path.join(root,'assets/cpu-tweezers-cut.png'),'rb').read()).decode()
s=s.replace('assets/cpu-tweezers-cut.png',f'data:image/png;base64,{png}')
open(os.path.join(root,'gadget-data-recovery-standalone.html'),'w',encoding='utf-8').write(s)
head=re.search(r'<head>(.*?)</head>',s,re.S).group(1); body=re.search(r'<body>(.*?)</body>',s,re.S).group(1)
head=re.sub(r'<meta charset="utf-8">\s*','',head); head=re.sub(r'<meta name="viewport"[^>]*>\s*','',head)
art=head.strip()+'\n'+body.strip()+'\n'
out=sys.argv[1] if len(sys.argv)>1 else '/private/tmp/claude-501/-Users-macbook/de1373a7-e12e-4495-933c-1d197386dea0/scratchpad/gdr/gadget-data-recovery.html'
open(out,'w',encoding='utf-8').write(art)
print('standalone', len(s), 'artifact', len(art), '->', out)
