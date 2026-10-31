"""Generate raw TTS + word boundaries with edge-tts (Microsoft Edge neural voices, en-NG)."""
import asyncio, json, os, sys, edge_tts, inspect
LINES = {'talk-01-welcome': "Hello! Welcome back today!",
         'talk-02-streak': "Hello! Let's continue your streak from yesterday!",
         'talk-03-help': "Hello! Do you need my help with anything?"}
VOICES = {'abeo': 'en-NG-AbeoNeural', 'ezinne': 'en-NG-EzinneNeural'}
RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'raw')   # raw TTS mp3 + word boundaries
async def one(key, text, vk, voice, rate='+0%', pitch='+0Hz'):
    kw = dict(rate=rate, pitch=pitch)
    if 'boundary' in inspect.signature(edge_tts.Communicate).parameters: kw['boundary'] = 'WordBoundary'
    c = edge_tts.Communicate(text, voice, **kw); words = []; audio = b''
    async for ch in c.stream():
        if ch['type'] == 'audio': audio += ch['data']
        elif ch['type'] == 'WordBoundary': words.append(dict(word=ch['text'], start=ch['offset'] / 1e7, dur=ch['duration'] / 1e7))
    open(f'{RAW}/{key}-{vk}.mp3', 'wb').write(audio); json.dump(words, open(f'{RAW}/{key}-{vk}.words.json', 'w'), indent=1)
    print(key, vk, len(audio), [(w['word'], round(w['start'], 2)) for w in words])
async def main():
    for k, t in LINES.items():
        for vk, v in VOICES.items(): await one(k, t, vk, v, rate='+5%', pitch='+16Hz' if vk == 'abeo' else '+4Hz')
asyncio.run(main())
