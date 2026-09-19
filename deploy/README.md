# EC2 deployment

The host needs Docker Engine, the Compose plugin, and Nginx. The workflow creates
`/opt/polis/.env.production` from GitHub Variables and Secrets on every deployment.
The application data lives in the `postgres-data` and `minio-data` Docker volumes.

1. Create `/opt/polis` on EC2. Set `APP_PORT` to `18080` unless it is already occupied;
   check with `sudo ss -ltnp | grep ':18080'`. If you choose another port, use the same
   port in the Nginx `proxy_pass`.
2. Copy `deploy/nginx/ec2.conf` to the Nginx sites directory, replace the domain, enable it,
    and provision TLS with Certbot. The external Nginx proxies only to `127.0.0.1:${APP_PORT}`.
3. Add these GitHub Actions Secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `AUTH_SECRET`,
   `POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD`, and whichever AI keys are used:
   `OPENAI_API_KEY`, `GOOGLE_API_KEY`, or `GOOGLE_ACCESS_TOKEN`.
    `EC2_SSH_KEY` must be the complete unencrypted private key, including its matching
    `BEGIN` and `END` lines;
   do not use the `.pub` file and do not put it in Variables.
4. Add these GitHub Actions Variables: `APP_PORT`, `APP_ORIGIN`, `POSTGRES_DB`, `POSTGRES_USER`,
   `MINIO_ROOT_USER`, `STORAGE_BUCKET`, `STORAGE_REGION`, `AI_PROVIDER`, `OPENAI_MODEL`,
   `GOOGLE_MODEL`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and `GOOGLE_VERTEX_EXPRESS`.

The workflow uploads the source archive. Docker images are built on EC2, Prisma migrations run
inside the backend container, and only changed services are recreated. The backend remains
reachable only through the Docker network.