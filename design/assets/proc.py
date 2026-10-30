import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

def remove_white(im, thr=238):
    a=np.array(im.convert('RGB')).astype(int)
    white=(a.min(axis=2)>=thr)
    lab,n=nd.label(white)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bg=np.isin(lab,list(edge))
    alpha=np.where(bg,0,255).astype(np.uint8)
    al=Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.8))
    out=im.convert('RGBA'); out.putalpha(al); return out

def trim(im,pad=8):
    bb=im.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox()
    x0,y0,x1,y1=bb
    return im.crop((max(0,x0-pad),max(0,y0-pad),min(im.width,x1+pad),min(im.height,y1+pad)))

m=Image.open('mascot-sheet.jpg'); print(m.size)
W=m.width
names=['happy','cheering','thinking','sleepy']
# split by columns using non-white column density
a=np.array(m.convert('L'))
cols=(a<235).sum(0)
print([int(c) for c in cols[::16]])
cuts=[0,330,675,960,W]
for i,nm in enumerate(names):
    c=m.crop((cuts[i],0,cuts[i+1],m.height))
    trim(remove_white(c)).save(f'mascot-{nm}.png')
remove_white(m).save('mascot-sheet-transparent.png')

g=Image.open('avatars-grid.jpg'); print(g.size)
a=np.array(g.convert('RGB')).astype(int)
mask=a.min(axis=2)<235
mask=nd.binary_opening(mask,iterations=3)
lab,n=nd.label(mask)
sizes=nd.sum(mask,lab,range(1,n+1))
objs=nd.find_objects(lab)
big=[(objs[i],sizes[i]) for i in range(n) if sizes[i]>20000]
big.sort(key=lambda o:(o[0][0].start//200,o[0][1].start))
for k,(sl,s) in enumerate(big):
    y0,y1=sl[0].start,sl[0].stop; x0,x1=sl[1].start,sl[1].stop
    cx,cy=(x0+x1)//2,(y0+y1)//2; r=min(x1-x0,y1-y0)//2-3
    crop=g.crop((cx-r,cy-r,cx+r,cy+r)).convert('RGBA')
    mk=Image.new('L',(4*2*r,4*2*r),0); ImageDraw.Draw(mk).ellipse((0,0,8*r-1,8*r-1),fill=255)
    crop.putalpha(mk.resize((2*r,2*r),Image.LANCZOS))
    crop.resize((320,320),Image.LANCZOS).save(f'av{k+1}.png'); print(k,cx,cy,r)

# girl avatar: transparent + circle crop of face
gi=Image.open('avatar-girl.jpg')
trim(remove_white(gi)).save('girl-cutout.png')
r=260; cx,cy=520,360
c=gi.crop((cx-r,cy-r,cx+r,cy+r)).convert('RGBA')
mk=Image.new('L',(2*r,2*r),0); ImageDraw.Draw(mk).ellipse((0,0,2*r-1,2*r-1),fill=255); c.putalpha(mk)
c.resize((320,320),Image.LANCZOS).save('av-girl.png')

lg=Image.open('logo-src.png'); print(lg.size)
lt=trim(remove_white(lg,245),4); lt.save('logo.png'); print(lt.size)
