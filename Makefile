install:
	@( \
		cd hardhat && \
		echo "🏗  Installing hardhat packages..." && \
		bun install --silent \
	)
	@( \
		cd app && \
		echo "🏗  Installing web app packages..." && \
		bun install --silent \
	)

run:
	@bunx pm2 flush --silent
	@( \
		cd hardhat && \
		echo "🚀 Starting hardhat node..." && \
		bunx pm2 delete hardhat-node --silent 2>/dev/null ||: && \
		bunx pm2 start "bun run node" --name hardhat-node --namespace web3 --silent \
	)
	@( \
		cd app && \
		echo "🚀 Starting web app..." && \
		bunx pm2 delete app --silent 2>/dev/null ||: && \
		bunx pm2 start "bun run start" --name app --namespace web3 --silent \
	)
	@echo "✅ Started" \

.PHONY: start
start: install run

.PHONY: stop
stop:
	@( \
		echo "🟡 Stopping..." && \
		bunx pm2 delete web3 --silent 2>/dev/null && \
		echo "🔴 Stopped" \
	)

.PHONY: hardhat-logs
hardhat-logs:
	bunx pm2 logs hardhat-node --lines 2000

.PHONY: app-logs
app-logs:
	bunx pm2 logs app --lines 2000

.PHONY: hardhat-test
hardhat-test:
	cd hardhat && bun run test && cd -

.PHONY: hardhat-deploy
hardhat-deploy:
	cd hardhat && bun run deploy && cd -

.PHONY: format
format:
	bunx prettier --write .
