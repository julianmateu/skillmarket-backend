# Skill Market Backend

This repository contains the code for the backend of [skillmarket.uk](https://skillmarket.uk). This is a [NodeJS](https://nodejs.org)
application that uses [Express](https://expressjs.com/).

This application uses [Redis](https://redis.io/) with the [RediSearch](https://oss.redislabs.com/redisearch/) module as a database. 

You can find the corresponding frontend application in [this GitHub repo](https://github.com/julianmateu/skillmarket-front).

This project was submitted to the [Redis 'Beyond Cache' Hackathon](https://redisbeyondcache2020.devpost.com), you can see
the submission and vote for it [here](https://devpost.com/software/skill-market-t5cova).

## Project setup
```
npm install
```

### Run
```
npm start 
```

### Test
```
npm test
```

### Lints and fixes files
```
npm run lint
```

## Database set up

You will need your own Redis instance with the RediSearch module installed.
You can use [Docker](), just run the following command to launch a container:
```bash
docker run -p 6379:6379 redislabs/redisearch:latest
```

If you want to set a password, you can ssh to the docker container and run the `config` command in `redis-cli`:
```bash
$ docker exec -it <your-container-name> redis-cli
> config set requirepass <your-password>
```

## Local development

To develop locally, you can use Skaffold to build the Docker image and deplooy to a Kubernetes cluster (minikube).

### Requirements
* [Docker](https://www.docker.com/)
* [Minikube](https://minikube.sigs.k8s.io/docs/start/)
* [Skaffold](https://skaffold.dev/)

Start the minikube node:
```bash
minikube start
```

Update the value of the `CORS_ORIGIN_HOST` env variable with the URL for the frontend in the [k8s deployment config](./k8s/deploy.yml). If the frontend runs locally with skaffold too, just change the port to the output of `minikube service skillmarket-front-node-port`

### Run in dev mode with Skaffold
In one terminal run skaffold in dev mode, which will run a dev server which refreshes on code change.
```bash
skaffold dev
```

To access the server locally, just forward the service port locally with minikube:
```bash
minikube service skillmarket-backend-node-port
```

## Deployment

You will need to define the following Environment variables:

```bash
REDIS_HOST="your-redis-host-IP"
REDIS_PASSWORD="your-redis-passowrd"
APP_HOSTNAME="your-app-hostname"
PORT="your-app-port"
CORS_ORIGIN_HOST="the-url-of-the-frontend"
SESSION_SECRET="your-express-session-secret"
```
