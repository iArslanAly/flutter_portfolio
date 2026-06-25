.PHONY: build validate serve clean

build:
	python3 scripts/build_site.py _site

validate: build
	python3 scripts/validate_site.py _site

serve: validate
	python3 -m http.server 8000 --directory _site

clean:
	rm -rf _site

