.PHONY: build generate setup help

-include .env
export

## build: Generate banner.svg + README.md locally (no push). Override: make build theme=light projects="repo1,repo2"
build:
	TEMPLATE=$(template) THEME=$(theme) PROJECTS=$(projects) npx tsx cli/index.ts --local

## generate: Generate files and push to your GitHub profile repo. Same overrides as build.
generate:
	TEMPLATE=$(template) THEME=$(theme) PROJECTS=$(projects) npx tsx cli/index.ts

## setup: Copy .env.example to .env (skips if .env already exists)
setup:
	@if [ -f .env ]; then \
		echo ".env already exists — skipping."; \
	else \
		cp .env.example .env; \
		echo ".env created. Open it and set GITHUB_USERNAME and PROFILE_REPO_TOKEN."; \
	fi

## help: Show available targets
help:
	@grep -E '^## ' Makefile | sed 's/## //'
