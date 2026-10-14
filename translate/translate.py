"""Vertaalt ontbrekende Engelse velden in een Payload-export naar het Engels,
met MyMemory via deep-translator (omgezet vanaf Google, dat vanaf dit netwerk
aanhoudend HTTP 429 gaf — zie PROJECT.md, "Nadelen van de huidige
vertaal-engine"). Vult NOOIT een veld dat al een Engelse waarde heeft (zie
is_empty-gate in process_doc/process_menu).

Let op MyMemory's limiet van 500 tekens per aanroep: langere tekstnodes
(lange alinea's in rich text) falen dan met NotValidLength — translate_text
vangt dat af als een gewone mislukking (zie "failed" in de samenvatting),
het crasht de run niet, maar dat veld/die node blijft dan onvertaald.

Gebruik:
    translate/.venv/bin/python translate/translate.py data/export.local.<ts>.json
"""

import copy
import json
import sys
import time
from pathlib import Path

from deep_translator import MyMemoryTranslator

_translator = MyMemoryTranslator(source="nl-NL", target="en-GB")

CONTENT_COLLECTIONS = [
    "nieuws",
    "agenda",
    "interviews",
    "geschiedenis",
    "duivelse-kunst",
    "vaklui",
    "praktische-info",
]

COLLECTION_FIELDS = {
    **{slug: {"title": "string", "content": "lexical"} for slug in CONTENT_COLLECTIONS},
    "media": {"alt": "string", "caption": "string"},
}


def translate_text(text):
    """Vertaal een losse string. Retourneert None bij een fout, zodat de
    aanroeper dat ene veld kan overslaan zonder de hele run af te breken."""
    if not text or not text.strip():
        return text
    try:
        time.sleep(0.3)  # niet te agressief tegen het onofficiële endpoint
        return _translator.translate(text)
    except Exception as e:  # noqa: BLE001 - bewust breed, per-veld isolatie
        print(f"[translate] MISLUKT op tekst (len={len(text)}): {e!r}")
        return None


def translate_lexical_node(node):
    """Wandel recursief door de Lexical AST; vertaal alleen `text` op
    type == 'text' leaf-nodes. Retourneert True als ergens in de subtree
    een fout optrad."""
    had_failure = False

    if node.get("type") == "text" and isinstance(node.get("text"), str):
        translated = translate_text(node["text"])
        if translated is None:
            had_failure = True
        else:
            node["text"] = translated
        return had_failure

    for child in node.get("children", []) or []:
        if translate_lexical_node(child):
            had_failure = True
    return had_failure


def translate_lexical_field(lexical_value):
    value = copy.deepcopy(lexical_value)
    root = value.get("root")
    if not root:
        return value, True  # misvormd -> als mislukt markeren
    had_failure = translate_lexical_node(root)
    return value, not had_failure


def is_empty(value):
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip() == ""
    if isinstance(value, dict) and "root" in value:
        return len(value.get("root", {}).get("children", [])) == 0
    return False


def process_doc(doc, field_kinds, stats):
    for field_name, kind in field_kinds.items():
        locale_value = doc.get(field_name)
        if not isinstance(locale_value, dict):
            continue

        nl_value = locale_value.get("nl")
        en_value = locale_value.get("en")

        if not is_empty(en_value):
            stats["skipped_already_translated"] += 1
            continue
        if is_empty(nl_value):
            stats["skipped_no_source"] += 1
            continue

        if kind == "lexical":
            translated, ok = translate_lexical_field(nl_value)
        else:
            translated = translate_text(nl_value)
            ok = translated is not None

        if ok:
            locale_value["en"] = translated
            stats["translated"] += 1
        else:
            stats["failed"] += 1
    return doc


def process_menu(menu_items, stats):
    for item in menu_items or []:
        label = item.get("label")
        if not isinstance(label, dict):
            continue
        nl_value = label.get("nl")
        en_value = label.get("en")

        if not is_empty(en_value):
            stats["skipped_already_translated"] += 1
            continue
        if is_empty(nl_value):
            stats["skipped_no_source"] += 1
            continue

        translated = translate_text(nl_value)
        if translated is not None:
            label["en"] = translated
            stats["translated"] += 1
        else:
            stats["failed"] += 1
    return menu_items


def new_stats():
    return {
        "translated": 0,
        "skipped_already_translated": 0,
        "skipped_no_source": 0,
        "failed": 0,
    }


def main():
    if len(sys.argv) < 2:
        print("Gebruik: translate.py <pad-naar-export.json>")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    data = json.loads(input_path.read_text())

    summary = {}

    for slug, field_kinds in COLLECTION_FIELDS.items():
        docs = data.get(slug, [])
        stats = new_stats()
        for doc in docs:
            process_doc(doc, field_kinds, stats)
        summary[slug] = stats
        print(f"[translate] {slug}: {stats}")

    global_data = data.get("global:site-instellingen")
    if isinstance(global_data, dict):
        text_stats = new_stats()
        process_doc(global_data, {"intro": "string", "footer": "string"}, text_stats)

        menu_stats = new_stats()
        process_menu(global_data.get("menu"), menu_stats)

        summary["site-instellingen.text"] = text_stats
        summary["site-instellingen.menu"] = menu_stats
        print(f"[translate] site-instellingen.text (intro+footer): {text_stats}")
        print(f"[translate] site-instellingen.menu: {menu_stats}")

    out_path = input_path.with_name(f"translated.{input_path.name}")
    out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"[translate] geschreven: {out_path}")

    summary_path = input_path.with_name(f"translated.{input_path.stem}.summary.json")
    summary_path.write_text(json.dumps(summary, indent=2))
    print(f"[translate] samenvatting: {summary_path}")


if __name__ == "__main__":
    main()
