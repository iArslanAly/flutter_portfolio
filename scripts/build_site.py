#!/usr/bin/env python3
"""Build a clean, deployable copy of the static portfolio."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "_site"
ROOT_FILES = (
    "CNAME",
    ".nojekyll",
    "robots.txt",
    "sitemap.xml",
    "site.webmanifest",
)
DIRECTORIES = ("assets",)


def build(output: Path) -> None:
    output = output.resolve()
    if output == ROOT or output in ROOT.parents:
        raise SystemExit("Build output must not replace the project source directory.")

    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)

    for html_file in ROOT.glob("*.html"):
        shutil.copy2(html_file, output / html_file.name)

    for filename in ROOT_FILES:
        source = ROOT / filename
        if not source.exists():
            raise SystemExit(f"Missing required source file: {filename}")
        shutil.copy2(source, output / filename)

    for dirname in DIRECTORIES:
        source = ROOT / dirname
        if not source.is_dir():
            raise SystemExit(f"Missing required source directory: {dirname}")
        shutil.copytree(source, output / dirname)

    print(f"Built {output.relative_to(ROOT) if output.is_relative_to(ROOT) else output}")


if __name__ == "__main__":
    destination = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUTPUT
    if not destination.is_absolute():
        destination = ROOT / destination
    build(destination)
