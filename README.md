# Evolution of Ethereum Architecture

How Ethereum's architecture changed with every upgrade, from Frontier (2015) to Fusaka, Glamsterdam, Hegotá and the Lean era. Live at **https://eth.rwxlabs.com**.

- `index.html`: one-glance architecture view with a timeline.
- `money/`: ETH as an asset, five labels and the protocol mechanics behind them.
- `node/`: an Ethereum node as engineers run it.
- `data-view/`: all 21 parts across 13 upgrades, with spec links and sources.
- `data/*.json`: the single source of data for every page.

Static site, no build step. Data is checked against `ethereum/consensus-specs`, `ethereum/execution-specs`, `ethereum/execution-apis`, `ethereum/EIPs` and `ethereum/forkcast`. Narrative base: *Mastering Ethereum, 2nd ed.* ([ethereumbook-animated](https://github.com/Rashmi-278/ethereumbook-animated)).

Run locally: `python3 -m http.server` in this folder.
