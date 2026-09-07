import json,sys,collections
def load(v):
    raw=open(v if v.endswith('.json') else f'/tmp/gdr-trace-{v}.json','rb').read().decode('utf-8','replace')
    try: return json.loads(raw)
    except Exception: return json.loads(raw.rstrip().rstrip(',')+']}')
def busy(evs):
    evs=sorted((e['ts'],e['ts']+e['dur']) for e in evs); tot=0; cs=ce=None
    for s,e in evs:
        if cs is None: cs,ce=s,e
        elif s<=ce: ce=max(ce,e)
        else: tot+=ce-cs; cs,ce=s,e
    if cs is not None: tot+=ce-cs
    return tot/1000
for v in sys.argv[1:]:
    d=load(v); ev=d['traceEvents']
    names={}
    for e in ev:
        if e.get('ph')=='M' and e.get('name')=='thread_name': names[(e['pid'],e['tid'])]=e['args']['name']
        if e.get('ph')=='M' and e.get('name')=='process_name': names[e['pid']]=e['args']['name']
    X=[e for e in ev if e.get('ph')=='X' and e.get('dur') and e['ts']>0]
    ts=[e['ts'] for e in X]; span=(max(ts)-min(ts))/1e6
    by=collections.defaultdict(list)
    for e in X: by[(e['pid'],e['tid'])].append(e)
    rows=collections.Counter()
    for k,lst in by.items():
        rows[(names.get(k[0],'?'),names.get(k,'?'))]+=busy(lst)/span
    frames=sum(1 for e in X if e['name']=='Display::DrawAndSwap')
    print(f'== {v}: span {span:.1f}s frames {frames} ({frames/span:.0f}/s)')
    for (p,t),ms in sorted(rows.items(),key=lambda x:-x[1])[:8]:
        if ms>15: print(f'   {p[:18]:18} {t[:28]:28} {ms:6.0f} ms/s busy')
