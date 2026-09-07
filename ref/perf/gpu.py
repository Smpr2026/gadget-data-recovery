import json,sys,collections
for p in sys.argv[1:]:
    ev=json.load(open(p))['traceEvents']; names={}
    for e in ev:
        if e.get('ph')=='M' and e.get('name')=='thread_name': names[(e['pid'],e['tid'])]=e['args']['name']
        if e.get('ph')=='M' and e.get('name')=='process_name': names[e['pid']]=e['args']['name']
    X=[e for e in ev if e.get('ph')=='X' and e.get('dur') and e['ts']>0]
    mins=collections.defaultdict(lambda:1e18)
    for e in X: mins[e['pid']]=min(mins[e['pid']],e['ts'])
    t0=max(mins.values())
    print('==',p)
    for lab,a,b in (('idle',0.5,3.0),('scroll',3.0,6.5)):
        W=[e for e in X if t0+a*1e6<=e['ts']<t0+b*1e6]; span=b-a
        gpu=[e for e in W if names.get((e['pid'],e['tid']))=='CrGpuMain']
        c=collections.Counter(); n=collections.Counter()
        for e in gpu: c[e['name']]+=e['dur']; n[e['name']]+=1
        print(f'  [{lab}] GPU main top events (ms/s, count/s):')
        for k,v in c.most_common(7): print(f'     {k[:60]:60} {v/1000/span:6.0f}  {n[k]/span:6.0f}')
        paints=[e for e in W if e['name']=='Paint' and 'clip' in e.get('args',{}).get('data',{})]
        area=collections.Counter(); cnt=collections.Counter(); rect={}
        for e in paints:
            cl=e['args']['data']['clip']; xs=cl[0::2]; ys=cl[1::2]; w=max(xs)-min(xs); h=max(ys)-min(ys)
            k=(e['args']['data'].get('layerId'),e['args']['data'].get('nodeId')); area[k]+=w*h; cnt[k]+=1; rect[k]=(int(w),int(h))
        print(f'  [{lab}] Paint events: {len(paints)/span:.0f}/s, top by painted area (Mpx/s):')
        for k,v in area.most_common(6): print(f'     layer {k[0]} node {k[1]} : {v/1e6/span:6.1f} Mpx/s  {cnt[k]/span:4.0f}/s  last clip {rect[k]}')
        rt=[e for e in W if e['name'] in ('RasterTask','RasterizerTaskImpl::RunOnWorkerThread')]
        print(f'  [{lab}] RasterTask {len(rt)/span:.0f}/s {sum(e["dur"] for e in rt)/1000/span:.0f} ms/s ; ImageDecode {sum(1 for e in W if e["name"] in ("Decode Image","ImageDecodeTask","Decode LazyPixelRef"))/span:.0f}/s')
