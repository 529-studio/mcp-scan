.PHONY: test scan docs-lint public-safety check help

help:
	@echo "make test          Run the test suite"
	@echo "make scan          Scan the repository's own MCP config"
	@echo "make docs-lint     Check docs budgets, links, lessons index"
	@echo "make public-safety Check for secrets and internal hostnames"
	@echo "make check         All of the above"

test:
	node test/run.js

scan:
	node src/cli.js . --fail-on high

docs-lint:
	python3 tools/docs/docs_lint.py

public-safety:
	bash scripts/check-public-safe.sh

check: test docs-lint public-safety
