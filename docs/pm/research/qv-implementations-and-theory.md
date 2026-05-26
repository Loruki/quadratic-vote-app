# Quadratic Voting: Implementations & Theory

## Academic Foundations

### Origins

Quadratic Voting (QV) was developed primarily by:

- **E. Glen Weyl** (Microsoft Research; Founder, RadicalxChange Foundation)
- **Eric A. Posner** (Professor of Law, University of Chicago)
- **Steven P. Lalley** (mathematician, University of Chicago) — co-authored the formal proof

QV builds on earlier mechanism design work by Groves & Ledyard (1977) and Hylland & Zeckhauser (1980).

### Key Papers

| Year | Paper                                                     | Authors                | Significance                                                |
| ---- | --------------------------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| 2014 | "Voting Squared: Quadratic Voting in Democratic Politics" | Posner & Weyl          | Core political theory application                           |
| 2014 | "Quadratic Voting as Efficient Corporate Governance"      | Posner & Weyl          | U of Chicago Law Review                                     |
| 2015 | "Quadratic Voting"                                        | Lalley & Weyl          | Formal proof: QV approaches efficiency as voter count grows |
| 2017 | "Quadratic Voting in the Wild"                            | Quarfoot et al.        | First empirical study with real participants                |
| 2018 | _Radical Markets_ (book)                                  | Posner & Weyl          | Popularized QV to mainstream audiences                      |
| 2018 | "Liberal Radicalism"                                      | Buterin, Hitzig & Weyl | Extended QV into Quadratic Funding (QF)                     |

### Core Mechanism

Cost of N votes = N^2 credits. Forces voters to reveal preference **intensity**, not just direction. A passionate minority can outweigh a mildly indifferent majority.

**Quadratic Funding (QF)** — extension by Buterin, Hitzig & Weyl: matching amount is proportional to the square of the sum of the square roots of individual contributions. 100 people x $1 is weighted more than 1 person x $100.

---

## Real-World Implementations

### Colorado State Legislature (2019–2024)

- **What:** Each lawmaker got 100 voice credits to allocate across 100+ pending bills
- **Partners:** RadicalxChange, Democracy Earth Foundation
- **Outcome (2019):** Top-ranked bill was Senate Bill 85 (Equal Pay for Equal Work Act). QV gave "a better signal with less noise" per Rep. Chris Hansen
- **Expansion:** House Democrats (2019) → Governor's Office (2020) → both chambers (2021) → Republicans joined (2022)
- **Ended:** January 2024 — court ruled anonymous QV ballots violated Colorado's open meetings laws
- **Key lesson:** Anonymity (needed for honest QV) conflicted with democratic transparency requirements

### Gitcoin Grants (2019–Present)

- **Mechanism:** Quadratic Funding for open-source / public goods
- **Scale:** $60M+ distributed, 230+ rounds, 3,715+ projects, 270,000+ unique donors
- **Growth:** 3,000% increase 2019–2022
- **Notable recipients:** Optimism, Uniswap, WalletConnect, Prysm, 1inch
- **Key challenge:** Sybil attacks. Led to creation of Gitcoin Passport (proof-of-personhood system, later acquired by Holonym for $10M)

### Taiwan Presidential Hackathon (2019–Present)

- **Context:** Under Digital Minister Audrey Tang
- **Mechanism:** QV with 99 voice credits per voter; 30% of scoring weight
- **Outcome:** "Stopped the follow-up effect and group-influenced decision" — broke committee herding patterns
- **Related:** vTaiwan platform uses online deliberation for national policy

### Optimism RetroPGF (2021–Present)

- **Round 1 (2021):** Used QV
- **Rounds 2-3:** Switched to mean, then median aggregation
- **Why abandoned QV:** Small voter pools made results highly sensitive to outlier allocations
- **Key insight:** QV's theoretical efficiency requires large N. With small groups, it underperforms

### Snapshot.org + DAO Ecosystem (2020–Present)

- **Scale:** 21,000+ DAO spaces, 1M+ votes for top DAOs
- **QV availability:** One of several voting strategies alongside token-weighted, basic, approval
- **Integration:** Gitcoin Passport for Sybil-resistant QV

### Other Notable Uses

- **CultureStake:** QV for community cultural programming decisions
- **Civilization VI:** Gathering Storm expansion uses QV for World Congress diplomacy (introduced QV to millions of gamers)
- **Civicbase:** Academic QVSR platform — QV as alternative to Likert scales in survey research

---

## Key Learnings

### What Worked

1. **Capturing preference intensity** — Colorado's #1 validated benefit
2. **Breaking social conformity** — Taiwan eliminated "judge herding"
3. **Better signal in surveys** — QVSR outperforms Likert scales for high-intensity preferences
4. **Rewarding breadth of support (QF)** — Gitcoin shifted power from large to small donors
5. **Iterative adoption** — Colorado expanded over 4 years, suggesting real institutional value

### What Failed

1. **Colorado halted by court** — anonymity vs transparency conflict
2. **Optimism abandoned QV** — small voter pools amplify outlier influence
3. **Sybil attacks** — splitting accounts converts QV back to linear voting
4. **Collusion** — coordinated groups break QV's efficiency properties

### Critical Gotchas

| Challenge                       | Detail                                                                     |
| ------------------------------- | -------------------------------------------------------------------------- |
| **Sybil attacks**               | Fake identities regain linear voting power. Requires identity verification |
| **Collusion**                   | Groups simulate single large voter across accounts                         |
| **Small group dynamics**        | Theoretical proofs assume large N. Small groups (10-20) are noisy          |
| **UX comprehension**            | Quadratic cost is non-intuitive. Users allocate suboptimally               |
| **Anonymity vs accountability** | Mechanism works best anonymously but public bodies need transparency       |
| **Leftover credits**            | Whole-number math means some credits can never be spent                    |
| **Equal budget required**       | QV's efficiency requires equal starting budgets for all voters             |
