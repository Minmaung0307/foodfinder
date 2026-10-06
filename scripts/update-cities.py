"""Manually refresh the open GeoNames city index; no API key required."""
import io,json,pathlib,urllib.request,zipfile,unicodedata
root=pathlib.Path(__file__).resolve().parents[1]
def download(name):
 request=urllib.request.Request('https://download.geonames.org/export/dump/'+name,headers={'User-Agent':'FoodFinder directory maintenance/1.0'})
 with urllib.request.urlopen(request,timeout=60) as response:return response.read()
def build(city_bytes,region_bytes,us_bytes):
 regions={line.split('\t')[0]:line.split('\t')[1] for line in region_bytes.decode().splitlines() if '\t' in line};rows=[]
 with zipfile.ZipFile(io.BytesIO(city_bytes)) as z:
  for line in z.read('cities15000.txt').decode().splitlines():
   c=line.split('\t');aliases=c[3].split(',');selected=aliases[:8];scripts=set()
   for alias in aliases:
    script=next((unicodedata.name(ch,'').split(' ')[0] for ch in alias if ch.isalpha()),'')
    if script not in ('','LATIN') and script not in scripts:
     scripts.add(script)
     if alias not in selected:selected.append(alias)
   rows.append([c[0],c[1],c[2],c[8],regions.get(c[8]+'.'+c[10],c[10]),float(c[4]),float(c[5]),int(c[14]),','.join(selected)])
 ids={r[0] for r in rows}
 with zipfile.ZipFile(io.BytesIO(us_bytes)) as z:
  for line in z.read('cities500.txt').decode().splitlines():
   c=line.split('\t')
   if c[8]!='US' or c[0] in ids:continue
   rows.append([c[0],c[1],c[2],c[8],regions.get('US.'+c[10],c[10]),float(c[4]),float(c[5]),int(c[14]),','.join(c[3].split(',')[:8])])
 rows.sort(key=lambda r:(r[3]!='US',-r[7]));target=root/'public/data/cities.json';target.write_text(json.dumps(rows,ensure_ascii=False,separators=(',',':')));print(len(rows),'cities written to',target)
if __name__=='__main__':build(download('cities15000.zip'),download('admin1CodesASCII.txt'),download('cities500.zip'))
