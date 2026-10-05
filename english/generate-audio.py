#!/usr/bin/env python3
"""Generate American-English practice and user-provided textbook photo audio.

Run with a Python environment containing edge-tts and with node/ffprobe on PATH:
    /path/to/venv/bin/python english/generate-audio.py
Valid existing MP3 files are reused; --force regenerates them.
--prune removes previously listed MP3 files no longer used by the curriculum.
"""

import argparse
import asyncio
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

import edge_tts


HERE = Path(__file__).resolve().parent
VOICE = "en-US-AriaNeural"
# Context selects the intended pronunciation of these homographs. Only the
# target WordBoundary interval is exported, never the complete context sentence.
CONTEXT_TARGETS = {"read-past": "read"}
CONTEXT_WORDS = {"read": "I read a book every day.", "use": "I use a book.",
                 "read-past": "I read a book yesterday."}


async def save_context_word(word, destination):
    context = CONTEXT_WORDS[word]
    target_word = CONTEXT_TARGETS.get(word, word)
    source = destination.with_suffix(".context.mp3")
    boundaries = []
    try:
        with source.open("wb") as audio:
            async for chunk in edge_tts.Communicate(
                context, VOICE, boundary="WordBoundary"
            ).stream():
                if chunk["type"] == "audio":
                    audio.write(chunk["data"])
                elif chunk["type"] == "WordBoundary" and chunk["text"].lower() == target_word:
                    boundaries.append(chunk)
        if len(boundaries) != 1:
            raise ValueError(f"Expected one boundary for {word}; got {len(boundaries)}")
        boundary = boundaries[0]
        # Edge offsets and durations use 100-nanosecond ticks.
        start = boundary["offset"] / 10_000_000
        end = start + boundary["duration"] / 10_000_000
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(source), "-af",
             f"atrim=start={start:.7f}:end={end:.7f},asetpts=PTS-STARTPTS",
             "-c:a", "libmp3lame", "-b:a", "48k", "-ar", "24000", str(destination)],
            check=True, capture_output=True,
        )
        return {"voice": VOICE, "context": context, "word": word,
                "start_seconds": start, "end_seconds": end}
    finally:
        source.unlink(missing_ok=True)


def load_clips():
    """Read the same curriculum exports consumed by the game."""
    program = """
import {WORDS, BOOKS} from './curriculum.js';
const units = BOOKS.flatMap(book => book.units);
const sentences = units.flatMap(unit => [...unit.sentences.map(sentence => sentence.en)]);
const grammar = units.flatMap(unit => unit.grammar.map(question =>
  question.prompt.replaceAll('___', question.answer)));
const lines = BOOKS.flatMap(book => (book.textbookPages ?? []).flatMap(page => page.blocks.flatMap(block => block.lines)));
console.log(JSON.stringify({words: WORDS, sentences: [...sentences, ...grammar, ...lines.map(line=>line.en)], speech: Object.fromEntries(lines.filter(line=>line.say).map(line=>[line.en,line.say]))}));
"""
    data = json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e", program], cwd=HERE, text=True
    ))
    clips = {}
    for key, word in data["words"].items():
        if "字母" in word["zh"] and re.fullmatch(r"[A-Za-z]|[A-Z] ?[a-z]", word["en"]):
            letter = word["en"][0].upper()
            CONTEXT_WORDS[key] = f"This is the letter {letter}."
            CONTEXT_TARGETS[key] = letter.lower()
        safe_id = re.sub(r"[^a-zA-Z0-9_-]", "-", key)
        spoken_word = word.get("say", word["en"])
        suffix = "-" + hashlib.sha256(spoken_word.encode()).hexdigest()[:12] if word.get("say") else ""
        clips[key] = (spoken_word, f"{safe_id}{suffix}.mp3")
    # Previous question snapshots and wrong-card reviews keep their original audio.
    legacy = json.loads((HERE / "legacy-sentences.json").read_text())
    for sentence in [*data["sentences"], *legacy]:
        # Chinese instructions are not spoken as English; only completed sentences.
        if re.search(r"[\u3400-\u9fff]", sentence) or "___" in sentence or not re.search(r"[A-Za-z0-9]", sentence):
            continue
        digest = hashlib.sha256(sentence.encode()).hexdigest()[:20]
        if data["speech"].get(sentence):
            digest += "-" + hashlib.sha256(data["speech"][sentence].encode()).hexdigest()[:12]
        spoken = re.sub(r"\b([A-Z])([a-z])\b", lambda match: match[1] if match[1].lower() == match[2] else match[0], data["speech"].get(sentence, sentence))
        tokens = spoken.split()
        if tokens and all(re.fullmatch(r"[A-Za-z]", token) for token in tokens):
            spoken = ". ".join(token.upper() for token in tokens) + "."
        clips[f"sentence:{sentence}"] = (spoken, f"sentence-{digest}.mp3")
    # Page-specific Chinese meanings do not require duplicate recordings. IPA
    # spelling differences also leave the spoken text unchanged for this voice.
    for key, word in data["words"].items():
        if not key.startswith("photo-game-"):
            continue
        equivalents = [(original_key, original) for original_key, original in data["words"].items()
                       if not original_key.startswith("photo-game-") and original["en"] == word["en"]
                       and original.get("say", original["en"]) == word.get("say", word["en"])]
        equivalent = next((item for item in equivalents if item[1]["ipa"] == word["ipa"]),
                          equivalents[0] if equivalents else None)
        if equivalent:
            clips[key] = clips[equivalent[0]]
    filenames = [filename for key, (_, filename) in clips.items() if not key.startswith("photo-game-")]
    if len(filenames) != len(set(filenames)):
        raise ValueError("Audio filename collision")
    return clips


def duration(path):
    if not path.exists() or path.stat().st_size == 0:
        return None
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration:stream=codec_name,codec_type", "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    if result.returncode:
        return None
    try:
        info = json.loads(result.stdout)
        seconds = float(info["format"]["duration"])
        mp3 = any(stream.get("codec_type") == "audio" and
                  stream.get("codec_name") == "mp3" for stream in info["streams"])
        return seconds if mp3 and seconds > 0 else None
    except (KeyError, TypeError, ValueError):
        return None


async def generate(args):
    clips = load_clips()
    audio_dir = HERE / "audio"
    audio_dir.mkdir(exist_ok=True)
    manifest = HERE / "audio-manifest.json"
    previous = json.loads(manifest.read_text()) if manifest.exists() else {}
    context_metadata = audio_dir / "context-pronunciation.json"
    contexts = json.loads(context_metadata.read_text()) if context_metadata.exists() else {}
    semaphore = asyncio.Semaphore(args.concurrency)
    completed, failures, seconds = {}, {}, []
    generated = 0

    async def produce(key, text, filename):
        nonlocal generated
        async with semaphore:
            destination = audio_dir / filename
            existing = duration(destination) if not args.force else None
            if key in CONTEXT_WORDS and (
                contexts.get(key, {}).get("context") != CONTEXT_WORDS[key] or
                contexts.get(key, {}).get("voice") != VOICE
            ):
                existing = None
            if existing is not None:
                completed[key] = filename
                seconds.append(existing)
                return
            temporary = destination.with_suffix(".tmp.mp3")
            for attempt in range(4):
                try:
                    if key in CONTEXT_WORDS:
                        provenance = await asyncio.wait_for(
                            save_context_word(key, temporary), timeout=60
                        )
                    else:
                        await asyncio.wait_for(
                            edge_tts.Communicate(text, VOICE).save(str(temporary)),
                            timeout=60,
                        )
                    valid_seconds = duration(temporary)
                    if valid_seconds is None:
                        raise ValueError("Generated file is not a valid nonempty MP3")
                    temporary.replace(destination)
                    if key in CONTEXT_WORDS:
                        contexts[key] = provenance
                    completed[key] = filename
                    seconds.append(valid_seconds)
                    generated += 1
                    if len(completed) % 25 == 0:
                        print(f"Validated {len(completed)}/{len(clips)} clips", flush=True)
                    return
                except Exception as error:
                    temporary.unlink(missing_ok=True)
                    if attempt == 3:
                        failures[key] = f"{type(error).__name__}: {error}"
                    else:
                        await asyncio.sleep(2 ** attempt)

    unique_files = {}
    for key, (text, filename) in clips.items():
        unique_files.setdefault(filename, (key, text))
    await asyncio.gather(*(produce(key, text, filename)
                          for filename, (key, text) in unique_files.items()))
    if failures:
        # Preserve the existing complete manifest when generation is incomplete.
        print(json.dumps(failures, ensure_ascii=False), file=sys.stderr)
        return 1
    for key, (_, filename) in clips.items():
        completed[key] = filename
    temporary_manifest = manifest.with_suffix(".tmp.json")
    temporary_manifest.write_text(
        json.dumps(dict(sorted(completed.items())), ensure_ascii=False, indent=2) + "\n"
    )
    temporary_manifest.replace(manifest)
    context_metadata.write_text(json.dumps(contexts, indent=2) + "\n")
    removed = 0
    if args.prune and not failures:
        for filename in set(previous.values()) - set(completed.values()):
            # Delete only safe MP3 names owned by the previous generated manifest.
            if Path(filename).name == filename and filename.endswith(".mp3"):
                (audio_dir / filename).unlink(missing_ok=True)
                removed += 1
    report = {
        "voice": VOICE, "expected": len(clips), "validated": len(completed),
        "generated": generated, "failed": len(failures),
        "removed": removed,
        "bytes": sum((audio_dir / file).stat().st_size for file in set(completed.values())),
        "duration_seconds": round(sum(seconds), 3),
    }
    print(json.dumps(report), flush=True)
    if failures:
        print(json.dumps(failures, ensure_ascii=False), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--concurrency", type=int, choices=range(1, 7), default=6)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--prune", action="store_true")
    sys.exit(asyncio.run(generate(parser.parse_args())))
