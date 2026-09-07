import json,sys,collections
def load(p): return json.load(open(p))['traceEvents']
def busy(evs):
    evs=sorted((e['ts'],e['ts']+e['dur']) for e in evs); tot=0; cs=ce=None
    for s,e in evs:
        if cs is None: cs,ce=s,e
        elif s<=ce: ce=max(ce,e)
        else: tot+=ce-cs; cs,ce=s,e
    if cs is not None: tot+=ce-cs
    return tot/1000
for p in sys.argv[1:]:
    ev=load(p); names={}
    for e in ev:
        if e.get('ph')=='M' and e.get('name')=='thread_name': names[(e['pid'],e['tid'])]=e['args']['name']
        if e.get('ph')=='M' and e.get('name')=='process_name': names[e['pid']]=e['args']['name']
    X=[e for e in ev if e.get('ph')=='X' and e.get('dur') and e['ts']>0]
    import collections as _c; mins=_c.defaultdict(lambda:1e18)
    for e in X: mins[e['pid']]=min(mins[e['pid']],e['ts'])
    t0=max(mins.values())  # true Tracing.start = latest process start (renderer buffers can hold older events)
    X=[e for e in X if e['ts']>=t0]
    print(f'== {p}')
    for lab,a,b in (('idle 0.5-3.0s',0.5,3.0),('scroll 3.0-6.5s',3.0,6.5)):
        W=[e for e in X if t0+a*1e6<=e['ts']<t0+b*1e6]; span=b-a
        by=collections.defaultdict(list)
        for e in W: by[(names.get(e['pid'],'?'),names.get((e['pid'],e['tid']),'?'))].append(e)
        rows=sorted(((k,busy(v)/span) for k,v in by.items()),key=lambda x:-x[1])
        frames=sum(1 for e in W if e['name']=='Display::DrawAndSwap')
        print(f'  [{lab}] frames {frames/span:.0f}/s  '+'  '.join(f'{k[0][:3]}/{k[1][:14]}={ms:.0f}' for k,ms in rows if ms>20))
    main=[e for e in X if names.get((e['pid'],e['tid']))=='CrRendererMain' and e['name'] in ('RunTask','ThreadControllerImpl::RunTask')]
    main.sort(key=lambda e:-e['dur'])
    print('  longest main-thread tasks:')
    for e in main[:4]:
        kids=[k for k in X if k['pid']==e['pid'] and k['tid']==e['tid'] and e['ts']<=k['ts']<e['ts']+e['dur'] and k is not e]
        c=collections.Counter()
        for k in kids: c[k['name']]+=k['dur']
        print(f"    +{(e['ts']-t0)/1e6:5.2f}s {e['dur']/1000:6.0f}ms : "+', '.join(f'{n}={d/1000:.0f}' for n,d in c.most_common(4)))
