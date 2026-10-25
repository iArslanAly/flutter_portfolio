"""Regression checks for the production validator and shared static content."""
import contextlib
import io
import json
import shutil
import tempfile
import unittest
from pathlib import Path

from sync_content import ROOT, render
from validate_site import validate


class SiteValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.site = Path(self.temp.name) / 'site'
        shutil.copytree(ROOT / '_site', self.site)

    def change_home(self, before, after):
        page = self.site / 'index.html'
        source = page.read_text()
        self.assertIn(before, source)
        page.write_text(source.replace(before, after, 1))

    def test_valid_site(self):
        with contextlib.redirect_stdout(io.StringIO()):
            validate(self.site)

    def test_absolute_internal_link_is_checked(self):
        self.change_home('href="#about"', 'href="https://iarslanaly.dev/missing-page/"')
        with self.assertRaisesRegex(SystemExit, 'missing local reference'):
            validate(self.site)

    def test_missing_description_is_rejected(self):
        self.change_home('name="description"', 'name="removed-description"')
        with self.assertRaisesRegex(SystemExit, 'missing description metadata'):
            validate(self.site)

    def test_wrong_canonical_is_rejected(self):
        self.change_home('rel="canonical" href="https://iarslanaly.dev/"',
                         'rel="canonical" href="https://iarslanaly.dev/projects/"')
        with self.assertRaisesRegex(SystemExit, 'incorrect canonical URL'):
            validate(self.site)

    def test_missing_form_label_is_rejected(self):
        self.change_home('<label for="fn">', '<label for="missing-name">')
        with self.assertRaisesRegex(SystemExit, 'form field without an explicit label'):
            validate(self.site)

    def test_shared_content_renders_static_values_and_schema(self):
        source = (ROOT / 'index.html').read_text()
        config = json.loads((ROOT / 'content/profile.json').read_text())
        self.assertEqual(render(source, config), source)
        config['statistics']['projects'] = 16  # Test fixture, never written to the site.
        config['education']['cgpa'] = 'TEST VALUE'
        result = render(source, config)
        self.assertIn('data-count="16">16+</div>', result)
        self.assertIn('data-content="statistics.projects">16+</div>', result)
        self.assertIn('CGPA TEST VALUE.', result)
        self.assertIn('data-content="education.cgpa">TEST VALUE</span>', result)


if __name__ == '__main__':
    unittest.main()
