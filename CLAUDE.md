@AGENTS.md

## Deployment

This app is hosted on GitHub Pages at https://urbanbacktrader29.github.io/Testing/

Deployment is automatic: `.github/workflows/deploy-pages.yml` builds a static export
(`next build` with `output: "export"`, triggered with `GITHUB_PAGES=true` so
`next.config.ts` applies the `/Testing` basePath) and publishes it via
`actions/deploy-pages` on every push to `claude/casino-website-stake-izy21y`.

**Whenever you make a change the user wants live, push it to
`claude/casino-website-stake-izy21y` — that alone redeploys the site.** No manual
Pages step is needed. After pushing, it's worth confirming the workflow run
succeeded (GitHub Actions tab / `mcp__github__actions_list`) rather than assuming.
