SHELL := /bin/bash
USE ?= bun
ifeq (${USE}, npm)
	PACKAGE_MANAGER ?= npm
	PACKAGE_EXECUTOR ?= npx
else ifeq (${USE}, yarn)
	PACKAGE_MANAGER ?= yarn
	PACKAGE_EXECUTOR ?= npx
else
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
run:
	@${PACKAGE_EXECUTOR} pm2 flush --silent
	@( \
		cd hardhat && \
		echo "🚀 Starting hardhat node..." && \
		${PACKAGE_EXECUTOR} pm2 delete hardhat-node --silent 2>/dev/null ||: && \
		${PACKAGE_EXECUTOR} pm2 start "${PACKAGE_MANAGER} run node" --name hardhat-node --namespace web3 --silent \
	)
	@( \
		cd app && \
		echo "🚀 Starting web app..." && \
		${PACKAGE_EXECUTOR} pm2 delete app --silent 2>/dev/null ||: && \
		${PACKAGE_EXECUTOR} pm2 start "${PACKAGE_MANAGER} run start" --name app --namespace web3 --silent \
	)
	@echo "✅ Started" \

.PHONY: start
start: install run

.PHONY: stop
stop:
	@( \
		echo "🟡 Stopping..." && \
		${PACKAGE_EXECUTOR} pm2 delete web3 --silent 2>/dev/null && \
		echo "🔴 Stopped" \
	)

.PHONY: hardhat-logs
hardhat-logs:
	${PACKAGE_EXECUTOR} pm2 logs hardhat-node --lines 2000

.PHONY: app-logs
app-logs:
	${PACKAGE_EXECUTOR} pm2 logs app --lines 2000

.PHONY: hardhat-test
hardhat-test:
	cd hardhat && ${PACKAGE_MANAGER} run test && cd -

.PHONY: hardhat-deploy
hardhat-deploy:
	cd hardhat && ${PACKAGE_MANAGER} run deploy && cd -

.PHONY: format
format:
	${PACKAGE_EXECUTOR} prettier --write .
