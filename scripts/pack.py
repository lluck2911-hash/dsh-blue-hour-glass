from pathlib import Path
import gzip, hashlib, io, json, tarfile, zipfile

root = Path(__file__).resolve().parent.parent
pkg = json.loads((root / 'package.json').read_text(encoding='utf-8'))
dist = root / 'dist'
dist.mkdir(exist_ok=True)
runtime = {'package.json'}
for entry in pkg['files']:
    item = root / entry
    if item.is_dir():
        runtime.update(p.relative_to(root).as_posix() for p in item.rglob('*') if p.is_file())
    elif item.is_file():
        runtime.add(entry)
    else:
        raise RuntimeError(f'Missing declared package file: {entry}')

def check_files(names):
    for name in names:
        if any(part in {'.git','node_modules','backups','sessions'} for part in Path(name).parts):
            raise RuntimeError(f'Private directory in archive: {name}')
        if any(fragment in name.lower() for fragment in ('.bak','.credentials','.env','client.original')):
            raise RuntimeError(f'Private or unlicensed resource in archive: {name}')

check_files(runtime)
buffer = io.BytesIO()
with tarfile.open(fileobj=buffer, mode='w', format=tarfile.PAX_FORMAT) as archive:
    for name in sorted(runtime):
        data = (root / name).read_bytes()
        info = tarfile.TarInfo('package/' + name)
        info.size = len(data)
        info.mode = 0o644
        info.mtime = 0
        archive.addfile(info, io.BytesIO(data))
tgz = dist / f"{pkg['name']}-{pkg['version']}.tgz"
with tgz.open('wb') as stream:
    with gzip.GzipFile(fileobj=stream, filename='', mode='wb', mtime=0) as compressed:
        compressed.write(buffer.getvalue())

source = set(runtime)
for entry in ('scripts','tests','.github','preview'):
    source.update(p.relative_to(root).as_posix() for p in (root / entry).rglob('*') if p.is_file())
source.update({'PUBLISHING.md','.gitignore'})
check_files(source)
zip_path = dist / f"{pkg['name']}-{pkg['version']}-source.zip"
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED) as archive:
    for name in sorted(source):
        info = zipfile.ZipInfo(f"{pkg['name']}/{name}", date_time=(2026,10,20,0,0,0))
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info,(root / name).read_bytes())
(dist / 'SHA256SUMS').write_text(''.join(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n" for p in (tgz,zip_path)),encoding='utf-8')
print(json.dumps({'package':tgz.name,'source':zip_path.name,'runtime_files':len(runtime),'source_files':len(source),'wallpaper':'original photograph, redistribution authorized by the user on 2026-10-20'},ensure_ascii=False))
