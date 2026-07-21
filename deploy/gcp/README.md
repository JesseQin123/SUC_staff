# DayDayUp on the existing GCP VM

This deployment keeps the application isolated from the existing Happy Model stack:

- Compose project: `daydayup`
- Container: `daydayup-app`
- Persistent volume: `daydayup_daydayup_data`
- Host-only diagnostic port: `127.0.0.1:5175`
- Shared proxy network: `relay-station_relay`
- Recommended hostname: `app.daydayup.co`

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

## Domain and HTTPS

Append the block in `deploy/gcp/Caddyfile.example` to the existing Caddyfile, validate it,
and reload Caddy. The domain currently uses GoDaddy nameservers, so create this record in
GoDaddy's DNS manager:

- Name: `app`
- Type: `A`
- Value: `34.61.130.145` (the reserved static address `relay-ip`)
- TTL: 600 seconds or the GoDaddy default

Do not change the existing root (`@`) record. Caddy obtains and renews the public TLS
certificate automatically after the new DNS record resolves to the VM.

The existing site and DayDayUp then share ports 80/443 through host-based routing:
`happy-model.com` continues to use its current container while `app.daydayup.co` routes to
`daydayup-app:5173`.

## Update and rollback

Before every update, record the current commit and back up the volume. Deploy a tested commit
with `git pull --ff-only` followed by the same Compose command. To roll back, check out the
previous commit and rebuild. The named volume is not removed by `docker compose down`; never
use `down -v` in production.
