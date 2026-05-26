# Socratic Questioning Framework for PRDs

This framework helps sharpen feature thinking through targeted questions. Use this to move from vague ideas to clear, well-reasoned feature definitions.

---

## Core Philosophy

**The goal is NOT to challenge the PM, but to help them think more clearly.**

Good Socratic questioning:

- Helps uncover assumptions
- Clarifies fuzzy thinking
- Surfaces potential issues early
- Strengthens the rationale

---

## The Five Question Categories

Use 3-5 questions total. Pick the most relevant from each category.

### 1. Problem Clarity Questions

**"What specific user pain point does this solve?"**

- Good: "Voters who receive a poll link don't understand quadratic voting — 100% are first-timers and the cost curve is counterintuitive"
- Bad: "Users want a better experience"

**"How do we know this is a real problem?"**

- Push for evidence: GitHub issues, user feedback, competitive analysis, usability testing

**"Who experiences this problem most acutely?"**

- Poll creators, voters, or developers?
- What context? (team decisions, classroom exercises, DAO governance, community prioritization)

**"What's the cost of NOT solving this?"**

### 2. Solution Validation Questions

**"Why is this the right solution for that problem?"**

**"What alternatives did you consider? Why did you reject them?"**

- "This is the only way" is a red flag

**"What's the simplest version that solves the core problem?"**

- Can we ship a smaller slice first?

**"How will users discover this feature?"**

- Is it obvious in the UI? Does it need onboarding? A tooltip?

### 3. Success Criteria Questions

**"How will we know if this feature is successful?"**

**"What would make you consider this feature a failure?"**

**"What metric are we trying to move? By how much?"**

- "Improve voting UX" → "Reduce time from opening poll link to submitting vote from 3 minutes to under 1 minute"
- "Better results" → "Increase % of voters who view results after voting from 40% to 70%"

### 4. Constraint & Trade-off Questions

**"What are the technical constraints or risks?"**

- Serverless cold starts? Supabase connection limits? Cookie-based identity limitations?

**"What are we NOT going to do as part of this?"**

**"What existing features or workflows does this affect?"**

**"If we had half the time, what would we cut?"**

### 5. Strategic Fit Questions

**"Why is this the right feature to build RIGHT NOW?"**

**"Does this serve all three audiences?"** (creators, voters, developers)

**"What happens if we wait 3 months to build this?"**

**"Does this make the repo a better showcase project?"**

---

## Conversation Flow

**Start Broad, Then Narrow:**

1. Problem clarity
2. Solution validation + success criteria
3. Strategic fit

## Listen for Red Flags

- **Vague language:** "Users want better..." → What specifically? Which user type?
- **Solution-first thinking:** Describes feature but struggles to describe problem
- **Lack of evidence:** "I think users would like..." → What do GitHub issues/feedback say?
- **Unclear success:** Can't articulate a measurable outcome
- **Scope creep:** "While we're at it, we should also..."

---

## Output Goal

After Socratic questioning, you should have:

- Clear, specific problem statement with evidence
- Rational justification for why THIS solution
- Concrete success criteria
- Explicit scope boundaries (what's in, what's out)
- Strategic narrative for why this matters now

These answers form the foundation of a strong PRD.

---

**Remember:** This is not a checklist. Pick the 3-5 most important questions for THIS feature. Quality over quantity.
