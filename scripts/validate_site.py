#!/usr/bin/env python3
"""Validate the generated static site before deployment."""

from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse


DOMAIN = "iarslanaly.dev"
REQUIRED_FILES = (
    "index.html",
    "services.html",
    "projects.html",
    "privacy-policy.html",
    "terms.html",
    "404.html",
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest",
    "CNAME",
    ".nojekyll",
)
REFERENCE_ATTRIBUTES = ("href", "src")
IGNORED_SCHEMES = ("http", "https", "mailto", "tel", "data", "javascript")


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.references: list[str] = []
        self.ids: set[str] = set()
        self.duplicate_ids: set[str] = set()
        self.h1_count = 0
        self.json_ld_blocks: list[str] = []
        self.is_redirect = False
        self._in_json_ld = False
        self._json_ld_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        if tag == "h1":
            self.h1_count += 1
        if tag == "meta" and attributes.get("http-equiv", "").lower() == "refresh":
            self.is_redirect = True

        element_id = attributes.get("id")
        if element_id:
            if element_id in self.ids:
                self.duplicate_ids.add(element_id)
            self.ids.add(element_id)

        for attribute in REFERENCE_ATTRIBUTES:
            value = attributes.get(attribute)
            if value:
                self.references.append(value)

        if tag == "script" and attributes.get("type") == "application/ld+json":
            self._in_json_ld = True
            self._json_ld_parts = []

    def handle_data(self, data: str) -> None:
        if self._in_json_ld:
            self._json_ld_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._in_json_ld:
            self.json_ld_blocks.append("".join(self._json_ld_parts))
            self._in_json_ld = False


def local_target(site: Path, page: Path, reference: str) -> tuple[Path, str] | None:
    parsed = urlparse(reference)
    if parsed.scheme in IGNORED_SCHEMES or parsed.netloc:
        return None

    path = unquote(parsed.path)
    if path.startswith("/"):
        target = site / (path.lstrip("/") or "index.html")
    elif path:
        target = page.parent / path
    else:
        target = page

    if target.is_dir():
        target /= "index.html"
    return target.resolve(), unquote(parsed.fragment)


def parse_page(page: Path) -> PageParser:
    parser = PageParser()
    parser.feed(page.read_text(encoding="utf-8"))
    return parser


def validate(site: Path) -> None:
    errors: list[str] = []

    for filename in REQUIRED_FILES:
        if not (site / filename).exists():
            errors.append(f"Missing required file: {filename}")

    sitemap_urls: list[str] = []
    try:
        manifest = json.loads((site / "site.webmanifest").read_text(encoding="utf-8"))
        if not manifest.get("icons"):
            errors.append("site.webmanifest: at least one icon is required")
    except (OSError, json.JSONDecodeError) as error:
        errors.append(f"site.webmanifest: {error}")

    try:
        sitemap_root = ET.parse(site / "sitemap.xml").getroot()
        namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        sitemap_urls = [
            item.text for item in sitemap_root.findall("s:url/s:loc", namespace) if item.text
        ]
        for url in sitemap_urls:
            parsed = urlparse(url)
            if parsed.netloc != DOMAIN:
                errors.append(f"sitemap.xml: unexpected domain in {url}")
            target = site / (parsed.path.lstrip("/") or "index.html")
            if not target.exists():
                errors.append(f"sitemap.xml: URL has no built page: {url}")
    except (OSError, ET.ParseError) as error:
        errors.append(f"sitemap.xml: {error}")

    html_pages = sorted(site.glob("*.html"))
    parsed_pages = {page.resolve(): parse_page(page) for page in html_pages}

    for page, parser in parsed_pages.items():
        if not parser.is_redirect and parser.h1_count != 1:
            errors.append(f"{page.name}: expected one H1, found {parser.h1_count}")
        if parser.duplicate_ids:
            errors.append(
                f"{page.name}: duplicate IDs: {', '.join(sorted(parser.duplicate_ids))}"
            )

        for position, block in enumerate(parser.json_ld_blocks, start=1):
            try:
                json.loads(block)
            except json.JSONDecodeError as error:
                errors.append(f"{page.name}: invalid JSON-LD block {position}: {error}")

        for reference in parser.references:
            resolved = local_target(site, page, reference)
            if not resolved:
                continue
            target, fragment = resolved
            if not target.exists():
                errors.append(f"{page.name}: missing local reference: {reference}")
                continue
            if fragment and target.suffix == ".html":
                target_parser = parsed_pages.get(target)
                if target_parser and fragment not in target_parser.ids:
                    errors.append(f"{page.name}: missing fragment target: {reference}")

    try:
        cname = (site / "CNAME").read_text(encoding="utf-8").strip()
        if cname != DOMAIN:
            errors.append(f"CNAME: expected {DOMAIN}, found {cname or 'an empty value'}")
    except OSError as error:
        errors.append(f"CNAME: {error}")

    if errors:
        raise SystemExit("Site validation failed:\n- " + "\n- ".join(errors))

    print(f"Validated {len(html_pages)} HTML pages and {len(sitemap_urls)} sitemap URLs.")


if __name__ == "__main__":
    site_directory = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
    if not site_directory.is_dir():
        raise SystemExit(f"Build directory does not exist: {site_directory}")
    validate(site_directory)
