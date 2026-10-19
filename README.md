# Pomuu: Graph walkthrough

A small application for checking the Zof flow from a GitHub pull request to a verification report. It has two real Node services and no npm dependencies:

```text
browser -> web -> API
```

The API calculates a quote. The web service requests that quote over HTTP and renders it. `docker-compose.yml` gives Graph the service folders; `zof.yaml` declares `web CALLS api`, with tier 1 for web and tier 2 for API. These tiers are demo choices. Owners are left undeclared until the team confirms them.

## Check locally

Use Node 20 or newer:

```bash
npm ci
npm test
```

The tests include a real HTTP request through web to API, plus invalid input, unavailable API, and incompatible API responses. They use temporary loopback ports and require no external credentials or services.

## Run the application

With Docker:

```bash
docker compose up -d --build --wait
```

Open http://localhost:4100. Changing the quantity makes web request a new quote from API. The API is also available at http://localhost:4101/quote?quantity=2. Stop this app with `docker compose down` from this repository.

Without Docker, run `npm run start:api` in one terminal and `npm run start:web` in another. Both bind to localhost by default. `PORT`, `HOST`, and web's `API_URL` can override the local defaults.

## Zof walkthrough

1. Merge this baseline onto `main` before asking Graph to read the repository. Graph reads the default branch for its map.
2. Connect `zoftest/pomuu` through the dedicated test company's GitHub App installation. Confirm the repo appears in Graph and has a graph revision.
3. Confirm the map has `service:pomuu/web` and `service:pomuu/api`, with a `CALLS` link from web to API.
4. Select the intended verification project for this repo in the console; an unassigned repo runs no project agents. Verify that the configured agents can run this Node project and collect its test results.
5. Create a separate PR that changes `services/api/quote.mjs`. Expected Graph result: API is directly changed and web is affected at depth 1 through the declared call. The read must be current; missing configuration remains explicit uncertainty.
6. Follow that PR's `change.analyzed` event to Control and Verification, then confirm a real verification run and its report in the console. Local test success alone does not prove this path.

The baseline contains no deliberate bug. Keep any failing-test demonstration in a separate PR and resolve it before merging.
