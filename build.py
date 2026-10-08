"""Build the website with Python's standard library. No installs required."""
from pathlib import Path
import html, json, re, shutil
ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
def inline(text):
    text = html.escape(text)
    text = re.sub(r'\[([^\]]+)\]\((https?://[^\s)]+)\)', r'<a href="\2">\1</a>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    return re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
def markdown(text):
    blocks = []
    for block in re.split(r'\n\s*\n', text.strip()):
        if not block: continue
        if block.startswith('### '): blocks.append('<h3>'+inline(block[4:])+'</h3>')
        elif block.startswith('## '): blocks.append('<h2>'+inline(block[3:])+'</h2>')
        elif block.startswith('# '): blocks.append('<h2>'+inline(block[2:])+'</h2>')
        elif block.startswith('> '): blocks.append('<blockquote>'+inline(block[2:])+'</blockquote>')
        elif all(line.startswith('- ') for line in block.splitlines()):
            blocks.append('<ul>'+''.join('<li>'+inline(line[2:])+'</li>' for line in block.splitlines())+'</ul>')
        else: blocks.append('<p>'+inline(block.replace('\n',' '))+'</p>')
    return ''.join(blocks)
def build():
    config = json.loads((ROOT/'config.json').read_text())
    essays=[]
    for path in sorted((ROOT/'content/essays').glob('*.md')):
        raw=path.read_text()
        if not raw.startswith('---\n'): raise ValueError(f'{path.name}: metadata must start with ---')
        _, metadata, body = raw.split('---', 2)
        meta=dict(line.split(':',1) for line in metadata.strip().splitlines())
        meta={k.strip():v.strip() for k,v in meta.items()}
        if not meta.get('title') or not meta.get('date'): raise ValueError(f'{path.name}: title and date required')
        essays.append({'id':path.stem, **meta, 'body':markdown(body)})
    poetry=[]
    for path in sorted((ROOT/'content/poetry').glob('*.md')):
        raw=path.read_text()
        if not raw.startswith('---\n'): raise ValueError(f'{path.name}: metadata must start with ---')
        _, metadata, body=raw.split('---', 2)
        meta={k.strip():v.strip() for k,v in (line.split(':',1) for line in metadata.strip().splitlines())}
        if not meta.get('title') or not meta.get('author'): raise ValueError(f'{path.name}: title and author required')
        poetry.append({'id':path.stem, 'title':meta['title'], 'author':meta['author'], 'date':meta.get('date',''), 'uploaded_by':meta.get('uploaded_by',''), 'text':body.strip('\n')})
    quotes=json.loads((ROOT/'content/quotes.json').read_text())
    for quote in quotes:
        if not quote.get('text') or not quote.get('author'): raise ValueError('Each quote needs text and author')
    data={'config':config,'essays':essays,'poetry':poetry,'quotes':quotes,'about':markdown((ROOT/'content/about.txt').read_text())}
    if config.get('description') == 'Essays, passages, and ideas worth returning to.':
        config['description'] = 'Notas, pasajes e ideas a los que vale la pena volver.'
    if (ROOT/'content/about.txt').read_text().strip() == 'This is my personal collection of essays, quotes, and ideas.\n\nI’m building it slowly, following my curiosity.':
        data['about'] = markdown('Esta es mi colección personal de notas, citas e ideas.\n\nLa voy construyendo de a poco, siguiendo mi curiosidad.')
    OUT.mkdir(exist_ok=True)
    shutil.copytree(ROOT/'assets',OUT/'assets',dirs_exist_ok=True)
    page=(ROOT/'index.html').read_text().replace('{{TITLE}}',html.escape(config['title'])).replace('{{DESCRIPTION}}',html.escape(config['description'],quote=True))
    (OUT/'index.html').write_text(page)
    (OUT/'data.json').write_text(json.dumps(data,ensure_ascii=False))
    (OUT/'.nojekyll').touch()
    print(f'Built {len(essays)} essays and {len(quotes)} quotes in {OUT}')
if __name__=='__main__': build()
