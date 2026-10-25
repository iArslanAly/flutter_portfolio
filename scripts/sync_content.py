#!/usr/bin/env python3
"""Keep static HTML fallbacks and profile structured data in sync with profile.json."""
from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / 'content/profile.json'


def render(source: str, profile: dict) -> str:
    def content(match: re.Match) -> str:
        key = match['key']
        group, field = key.split('.')
        value = profile[group][field]
        attributes = match['attributes']
        if group == 'statistics':
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                raise ValueError(f'{key} must be a non-negative integer')
            attributes = re.sub(r'data-count="[^"]*"', f'data-count="{value}"', attributes)
            value = f'{value}+'
        return f'<{match["tag"]}{attributes}>{html.escape(str(value))}</{match["tag"]}>'

    source = re.sub(
        r'<(?P<tag>\w+)(?P<attributes>[^>]*\bdata-content="(?P<key>[\w.]+)"[^>]*)>[^<]*</(?P=tag)>',
        content, source,
    )

    def structured_data(match: re.Match) -> str:
        data = json.loads(match[1])
        for entity in data.get('@graph', []):
            if entity.get('@id') != 'https://iarslanaly.dev/#person':
                continue
            education = profile['education']
            entity['alumniOf']['name'] = education['university']
            entity['hasCredential'] = {
                '@type': 'EducationalOccupationalCredential',
                'name': education['degree'],
                'credentialCategory': 'Bachelor degree',
                'recognizedBy': {'@type': 'CollegeOrUniversity', 'name': education['university']},
                'description': f"{education['period']}; graduated {education['graduation_year']}; CGPA {education['cgpa']}.",
            }
        return '<script type="application/ld+json">\n' + json.dumps(data, indent=2, ensure_ascii=False) + '\n</script>'

    return re.sub(r'<script type="application/ld\+json">(.*?)</script>', structured_data, source, flags=re.S)


def sync(check: bool = False) -> None:
    profile = json.loads(CONFIG.read_text(encoding='utf-8'))
    page = ROOT / 'index.html'
    source = page.read_text(encoding='utf-8')
    rendered = render(source, profile)
    if check and source != rendered:
        raise SystemExit('Profile content is stale. Run python3 scripts/sync_content.py before building.')
    if not check:
        page.write_text(rendered, encoding='utf-8')
    print('Profile content is consistent.' if check else 'Synced profile content.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    sync(parser.parse_args().check)
