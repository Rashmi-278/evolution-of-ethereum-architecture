# Evolution of Ethereum Architecture

How Ethereum's architecture changed with every upgrade, from Frontier (2015) to Fusaka, Glamsterdam, Hegotá and the Lean era. Live at **https://eth.rwxlabs.com/architecture-evolution/**.

- `architecture-evolution/index.html`: one-glance architecture view with a timeline.
- `architecture-evolution/money/`: ETH as an asset, five labels and the protocol mechanics behind them.
- `architecture-evolution/engineers/`: the node as engineers run it, upgrade by upgrade.
- `architecture-evolution/data-view/`: all 21 parts across 13 upgrades, with spec links and sources.
- `architecture-evolution/data/*.json`: the single source of data for every page.

Static site, no build step. Data is checked against `ethereum/consensus-specs`, `ethereum/execution-specs`, `ethereum/execution-apis`, `ethereum/EIPs` and `ethereum/forkcast`. Narrative base: *Mastering Ethereum, 2nd ed.* ([ethereumbook-animated](https://github.com/Rashmi-278/ethereumbook-animated)).

Run locally: `python3 -m http.server` in this folder.
