NAME = $(shell ./_make/package-json "name")
VERSION = $(shell ./_make/package-json "version")
DATE = $(shell date +'%Y-%m-%d')
DOC_SRC = $(shell find doc -name "*.md" -type f)
DOC_DEST = $(DOC_SRC:doc/%.1.md=dist/man/man1/%.1)

all: dist

# sed: undo groff's behavior of single quotes -> acute accent
# perl: write a more precise iso8601 date (2013-08-17 instead of "August 2013")
dist/man/man1/%.1: doc/%.1.md
	@mkdir -p $(@D)
	@set -e; \
	cat $< \
	| ./_make/doc-preprocess - \
	| ronn --roff --manual="AMD Manual" --organization="$(NAME) $(VERSION)" --pipe \
	| sed -E "s/\\\\'/\\\\(aq/g" \
	| perl -pe 's/^(.TH ".*?" ".*?" ").*?(".*)/$${1}$(DATE)$$2/' \
	> $@
	@echo "$< -> $@"

doc: $(DOC_DEST)

dist: doc
	rsync -aL --out-format="%n%L%i" src dist
	rsync -aL --out-format="%n%L%i" bin dist
	cp README.md dist/
	cp MIT-LICENSE.txt dist/
	cp package.json dist/

clean:
	rm -Rf dist/

install:
	cd dist; npm install -g

publish:
	cd dist; npm publish

.PHONY: all doc dist clean install publish
