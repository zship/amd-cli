NAME = $(shell ./_make/package-json "name")
VERSION = $(shell ./_make/package-json "version")
DOC_SRC = $(shell find doc -name "*.md" -type f)
DOC_DEST = $(DOC_SRC:doc/%.1.md=dist/man/man1/%.1)

dist/man/man1/%.1: doc/%.1.md
	@mkdir -p $(@D)
	# sed below is used to undo groff's behavior of single quotes -> acute accent
	cat $< \
	| ./_make/doc-preprocess - \
	| ronn --roff --manual="AMD Tools CLI Manual" --organization="$(NAME) $(VERSION)" --date="$(shell date +'%Y-%m-%d')" --pipe \
	| sed -r "s/\\\\'/\\\\(aq/g" \
	> $@

doc: $(DOC_DEST)

dist: doc
	rsync -aL --out-format="%n%L%i" src dist
	rsync -aL --out-format="%n%L%i" bin dist
	cp README.md dist/
	cp MIT-LICENSE.txt dist/
	cp package.json dist/

clean:
	rm -Rf dist/

.PHONY: doc dist clean
