# Fenêtres de l'Avent

Public Advent window calendar. Grenoble (38000) is the example municipality; configure another municipality in `src/lib/config/site.js` and provide its boundary in `config/commune.geojson`. Visitors can browse the December 1–24 calendar, register a window without an account, and subscribe to a public iCalendar feed.

## Requirements

- Node.js 24
- npm

## Local development

```sh
npm ci
npm run db:migrate
npm run dev
```

The app reads `DATABASE_URL` for its SQLite file. `.env.example` contains local defaults; copy it to `.env` if you do not already have a local environment file. The local dev server uses port 3024. Keep `.env` private.

Useful checks:

```sh
npm test
npm run check
npm run lint
npm run build
```

Generate and apply later schema changes with `npm run db:generate` and `npm run db:migrate`. Avoid `db:push` for a database with data; migrations are the checked-in deployment path.

## Configuration

Edit `src/lib/config/site.js` to change the site title, active Advent year, rules version, municipality identifiers, map center/bounds, and tile provider. Grenoble is the example boundary; replace it with the boundary for your chosen municipality. The boundary file path is configured in the site config. `ORIGIN` sets the public site origin used in generated URLs, including the iCalendar events.

Boundary files must be GeoJSON `Polygon` or `MultiPolygon` geometries in longitude/latitude order. Registration locations are checked against this boundary on the server. The address API is proxied by `/api/addresses` and filtered to the configured INSEE code.

The participant rules live in `src/lib/content/rules.md`. Increment `rulesVersion` in the site config whenever the rules text changes so each registration keeps the version accepted at submission.

## Routes

- `/` — public calendar and subscription link
- `/register/[date]` — no-account registration form
- `/rules` — event rules
- `/calendar.ics` — stable, read-only, multi-year iCalendar feed
- `/api/addresses?q=...` — municipality-restricted IGN address suggestions

Participant name, description, address, and map point are public. Email and phone are server-only and omitted from public loads and the iCalendar feed. Registrations are immediately confirmed; SQLite enforces one active registration per date.

## Before public launch

Review the event rules for the municipality and finalize the applicable privacy notice, legal information, retention/deletion policy, and data-controller details. Add appropriate abuse protection at the public edge.

## Docker deployment

The production image uses `adapter-node`; development remains local and does not require Docker.

```sh
docker compose up -d --build
```

Compose stores SQLite in the persistent `advent-data` volume and runs migrations before starting the server. The default host port is `3024`; set `ORIGIN` to the public HTTPS origin before building, and `APP_PORT` to the host port reachable by the reverse proxy. The app port is bound to `127.0.0.1` by default so it is not directly exposed to the Internet. HTTPS termination is the reverse proxy's responsibility.

Back up the live database using SQLite's backup API, not by copying the file while it is open:

```sh
docker compose exec -T app node --input-type=module -e 'import Database from "better-sqlite3"; const db = new Database(process.env.DATABASE_URL); await db.backup("/data/advent-backup.sqlite"); db.close();'
docker cp "$(docker compose ps -q app):/data/advent-backup.sqlite" ./advent-backup.sqlite
```

To restore a verified backup, stop the app, copy the backup into the stopped container, replace the database as the container's `node` user, then start it again:

```sh
docker compose stop app
docker cp ./advent-backup.sqlite "$(docker compose ps --all --quiet app):/data/advent-restore.sqlite"
docker compose run --rm --user root --entrypoint sh app -c 'mv /data/advent-restore.sqlite /data/advent.sqlite && chown node:node /data/advent.sqlite'
docker compose start app
```

`docker compose down` preserves the named volume; `docker compose down -v` deletes the database.
