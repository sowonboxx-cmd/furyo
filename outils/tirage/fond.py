from PIL import Image, ImageFilter, ImageDraw
import sys
def comp(src, box, out, cx=0.40, hs=1.12, W=2400, H=900, yoff=0.0):
  im=Image.open(src).convert('RGB'); w,h=im.size
  b=[int(v*(w if i%2==0 else h)) if v<=1 else int(v) for i,v in enumerate(box)]
  art=im.crop(tuple(b))
  bg=art.resize((W,int(W*art.height/art.width))); top=(bg.height-H)//2; bg=bg.crop((0,top,W,top+H)).filter(ImageFilter.GaussianBlur(40))
  ah=int(H*hs); aw=int(art.width*ah/art.height); a=art.resize((aw,ah),Image.LANCZOS)
  x=int(W*cx-aw/2); y=int(-H*yoff)
  m=Image.new('L',(aw,ah),255); d=ImageDraw.Draw(m); f=int(aw*0.18)
  for i in range(f):
    v=int(255*i/f); d.line([(i,0),(i,ah)],fill=v); d.line([(aw-1-i,0),(aw-1-i,ah)],fill=v)
  bg.paste(a,(x,y),m); bg.save(out,quality=90)
comp('kj5.jpg',(0,0.27,1,1),'fond-kujo.jpg',cx=0.40,hs=1.25,yoff=0.02)
comp('fb5.jpg',(0.17,0.30,1,1),'fond-fable.jpg',cx=0.40,hs=1.25,yoff=0.02)
comp('sg-mag.jpg',(300,300,858,1005),'fond-sangaku.jpg',cx=0.36,hs=1.12,yoff=0.0)
