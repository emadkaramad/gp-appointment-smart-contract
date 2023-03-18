SHELL := /bin/bash
USE ?= npm

ifeq (${USE}, npm)
	PACKAGE_MANAGER ?= npm
	PACKAGE_EXECUTOR ?= npx
else ifeq (${USE}, yarn)
	PACKAGE_MANAGER ?= yarn
	PACKAGE_EXECUTOR ?= npx
else ifeq (${USE}, bun)
	PACKAGE_MANAGER ?= bun
	PACKAGE_EXECUTOR ?= bunx
endif

.PHONY: install
install:
	@( \
		cd common && \
		echo "🏗  Installing common packages..." && \
		${PACKAGE_MANAGER} install --silent \
	)
	@( \
		cd hardhat && \
		echo "🏗  Installing hardhat packages..." && \
		${PACKAGE_MANAGER} install --silent \
	)
	@( \
		cd app && \
		echo "🏗  Installing web app packages..." && \
		${PACKAGE_MANAGER} install --silent \
	)

.PHONY: run
run-hardhat:
	@( \
		cd hardhat && \
		echo "🚀 Starting hardhat node..." && \
		${PACKAGE_EXECUTOR} pm2 delete hardhat-node --silent 2>/dev/null ||: && \
		${PACKAGE_EXECUTOR} pm2 start "${PACKAGE_MANAGER} run node" --name hardhat-node --namespace web3 --silent \
	)

run-app:
	@( \
		cd app && \
		echo "🚀 Starting web app..." && \
		${PACKAGE_EXECUTOR} pm2 delete app --silent 2>/dev/null ||: && \
		${PACKAGE_EXECUTOR} pm2 start "${PACKAGE_MANAGER} run start" --name app --namespace web3 --silent \
	)

run-app-dev:
	@( \
		cd app && \
		echo "🚀 Starting web app..." && \
		${PACKAGE_EXECUTOR} pm2 delete app --silent 2>/dev/null ||: && \
		${PACKAGE_EXECUTOR} pm2 start "${PACKAGE_MANAGER} run dev" --name app --namespace web3 --silent \
	)

.PHONY: start-hardhat
start-hardhat: install clear-logs run-hardhat deploy-contract

.PHONY: start
start: install clear-logs run-hardhat deploy-contract run-app
	@echo "✅ Started"

.PHONY: start-dev
start-dev: install clear-logs run-hardhat deploy-contract run-app-dev
	@echo "✅ Started (Dev)"

.PHONY: stop
stop:
	@( \
		echo "🟡 Stopping..." && \
		${PACKAGE_EXECUTOR} pm2 delete web3 --silent 2>/dev/null && \
		echo "🔴 Stopped" \
	)

.PHONY: clear-logs
	@${PACKAGE_EXECUTOR} pm2 flush --silent

.PHONY: hardhat-logs
hardhat-logs:
	${PACKAGE_EXECUTOR} pm2 logs hardhat-node --lines 2000

.PHONY: app-logs
app-logs:
	${PACKAGE_EXECUTOR} pm2 logs app --lines 2000

.PHONY: hardhat-test
hardhat-test:
	cd hardhat && ${PACKAGE_MANAGER} run test && cd -

.PHONY: deploy-contract
deploy-contract:
	@( \
		echo "✍️  Deploying GP contract..." && \
		cd hardhat && ${PACKAGE_MANAGER} run deploy && cd - \
	)

.PHONY: format
format:
	cd app && ${PACKAGE_EXECUTOR} rome format .

.PHONY: format-fix
format-fix:
	cd app && ${PACKAGE_EXECUTOR} rome format --write .

.PHONY: lint
lint:
	cd app && ${PACKAGE_EXECUTOR} rome check .

.PHONY: lint-fix
lint-fix:
	cd app && ${PACKAGE_EXECUTOR} rome check --apply .
