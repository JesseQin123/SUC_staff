# DayDayUp on the existing GCP VM

This deployment keeps the application isolated from the existing Happy Model stack:

- Compose project: `daydayup`
- Container: `daydayup-app`
- Persistent volume: `daydayup_daydayup_data`
- Host-only diagnostic port: `127.0.0.1:5175`
- Shared proxy network: `relay-station_relay`
- Production hostname: `daydayup.co`

## Deploy

```bash
git clone https://github.com/JesseQin123/SUC_staff.git ~/daydayup
cd ~/daydayup
cp .env.docker.example .env.docker
# Replace APP_SECRET with: openssl rand -hex 32
sudo docker compose --env-file .env.docker \
  -f compose.yaml -f deploy/gcp/compose.yaml up -d --build
```

Verify locally on the VM:

```bash
curl -fsS http://127.0.0.1:5175/api/health
sudo docker compose --env-file .env.docker \
  -f compose.yaml -f deploy/gcp/compose.yaml ps
```

## Move the configured local workspace to the VM

The browser setup is stored in SQLite, including employees, knowledge indexes, Skills, SOPs,
tasks, memory and model configuration. Do not copy the live `-wal` file or commit any database
snapshot to Git. Create a consistent SQLite backup on the local machine:

```bash
sqlite3 backend/skill_agent_loop.db ".backup 'daydayup-config.db'"
scp daydayup-config.db YOUR_VM_USER@34.61.130.145:~/daydayup/daydayup-config.db
```

The snapshot contains the configured model credential. Transfer it only over SSH and treat it
as a secret. After the image and named volume have been created on the VM, stop only the
DayDayUp service, import the snapshot with the runtime UID, and start it again:

```bash
cd ~/daydayup
sudo docker compose --env-file .env.docker \
  -f compose.yaml -f deploy/gcp/compose.yaml stop daydayup
sudo docker run --rm --user 0 \
  -v daydayup_daydayup_data:/data \
  -v "$PWD":/import \
  daydayup:latest \
  sh -c 'cp /import/daydayup-config.db /data/skill_agent_loop.db && chown 10001:10001 /data/skill_agent_loop.db && chmod 600 /data/skill_agent_loop.db'
sudo docker compose --env-file .env.docker \
  -f compose.yaml -f deploy/gcp/compose.yaml start daydayup
curl -fsS http://127.0.0.1:5175/api/health
```

Verify the nine Solo Unicorn employees, six knowledge bases, four scheduled tasks and the
default model in the UI before deleting the local and VM transfer snapshots.

## Domain and HTTPS

Append the block in `deploy/gcp/Caddyfile.example` to the existing Caddyfile, validate it,
and reload Caddy. DNS is hosted by Cloudflare. Create this record in Cloudflare DNS:

- Name: `@`
- Type: `A`
- Value: `34.61.130.145` (the reserved static address `relay-ip`)
- TTL: Auto
- Proxy status: DNS only while Caddy obtains the initial certificate

Caddy obtains and renews the public TLS certificate automatically after the root record
resolves to the VM. Confirm `https://daydayup.co` works directly, then enable Cloudflare's
Proxied status and set SSL/TLS mode to Full (strict). Do not use Flexible mode.

The existing site and DayDayUp then share ports 80/443 through host-based routing:
`happy-model.com` continues to use its current container while `daydayup.co` routes to
`daydayup-app:5173`.

## Update and rollback

Before every update, record the current commit and back up the volume. Deploy a tested commit
with `git pull --ff-only` followed by the same Compose command. To roll back, check out the
previous commit and rebuild. The named volume is not removed by `docker compose down`; never
use `down -v` in production.
