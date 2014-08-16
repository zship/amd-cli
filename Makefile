NAME = $(shell ./_make/package-json "name")
VERSION = $(shell ./_make/package-json "version")
DATE = $(shell date +'%Y-%m-%d')
DOC_SRC = $(shell find doc -name "*.md" -type f)
DOC_DEST = $(DOC_SRC:doc/%.1.md=dist/man/man1/%.1)


# https://stackoverflow.com/questions/3524726/how-to-make-eval-shell-work-in-gnu-make
define newline


endef


.PHONY: all
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

.PHONY: doc
doc: $(DOC_DEST)


JS_SRC = $(shell find src -type f -name '*.js')
JS_DIST = $(JS_SRC:src/%.js=dist/lib/%.js)

$(eval $(subst #,$(newline),$(shell \
	./_make/gen -t '$(JS_DIST)' -d '$(JS_SRC)' -c './_make/make-es6 "$$(<)" "$$(@)"' \
	| tr '\n' '#')))


.PHONY: dist
dist: $(JS_DIST) doc
	rsync -aL --out-format="%n%L%i" bin dist
	cp README.md dist/
	cp MIT-LICENSE.txt dist/
	cp package.json dist/

.PHONY: clean
clean:
	rm -Rf dist/

.PHONY: install
install:
	cd dist; npm install -g

.PHONY: publish
publish: clean dist
	cd dist; npm publish
