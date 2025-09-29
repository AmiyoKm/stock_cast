up:
	docker compose --env-file secrets.env up
build:
	docker compose --env-file secrets.env up --build
