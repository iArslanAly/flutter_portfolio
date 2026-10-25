.PHONY: build validate test serve clean

build:
	python3 scripts/build_site.py _site

validate: build
	python3 scripts/validate_site.py _site

test: validate
	python3 -m unittest discover -s scripts -p 'test_*.py'
	node --check assets/js/script.js
	node --check assets/js/consent.js
	node scripts/test_consent.cjs

serve: validate
	python3 -m http.server 8000 --directory _site

clean:
	rm -rf _site

