SHELL := /bin/bash
RUNTIME ?= bun
RUNTIMEX ?= bunx

.PHONY: install
install:
	@( \
		cd hardhat && \
		echo "🏗  Installing hardhat packages..." && \
		${RUNTIME} install --silent \
	)
	@( \
		cd app && \
		echo "🏗  Installing web app packages..." && \
		${RUNTIME} install --silent \
	)

.PHONY: run
run:
	@${RUNTIMEX} pm2 flush --silent
	@( \
		cd hardhat && \
		echo "🚀 Starting hardhat node..." && \
		${RUNTIMEX} pm2 delete hardhat-node --silent 2>/dev/null ||: && \
		${RUNTIMEX} pm2 start "${RUNTIME} run node" --name hardhat-node --namespace web3 --silent \
	)
	@( \
		cd app && \
		echo "🚀 Starting web app..." && \
		${RUNTIMEX} pm2 delete app --silent 2>/dev/null ||: && \
		${RUNTIMEX} pm2 start "${RUNTIME} run start" --name app --namespace web3 --silent \
	)
	@echo "✅ Started" \

.PHONY: start
start: install run

.PHONY: stop
stop:
	@( \
		echo "🟡 Stopping..." && \
		${RUNTIMEX} pm2 delete web3 --silent 2>/dev/null && \
		echo "🔴 Stopped" \
	)

.PHONY: hardhat-logs
hardhat-logs:
	${RUNTIMEX} pm2 logs hardhat-node --lines 2000

.PHONY: app-logs
app-logs:
	${RUNTIMEX} pm2 logs app --lines 2000

.PHONY: hardhat-test
hardhat-test:
	cd hardhat && ${RUNTIME} run test && cd -

.PHONY: hardhat-deploy
hardhat-deploy:
	cd hardhat && ${RUNTIME} run deploy && cd -

.PHONY: format
format:
	${RUNTIMEX} prettier --write .
