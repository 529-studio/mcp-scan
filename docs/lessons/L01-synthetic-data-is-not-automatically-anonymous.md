# L01: Synthetic Data Is Not Automatically Anonymous

## Context & Problem

A synthetic persona dataset can look privacy-safe because no human was surveyed. That label is not a legal conclusion. Under the GDPR, identifiability is a property of the data and the context, not of the generation method. Vietnam's Personal Data Protection Law uses the same functional test: data that identifies or helps identify a person is personal data.

The Nemotron-Personas-Vietnam card says the data is fully generated and similarities are coincidental. That is a useful statement, but it is not a re-identification assessment.

## Root Cause

Teams treat "synthetic" as a synonym for "anonymous". The law does not. A synthetic record can still be linkable through rare combinations, and a generated name can coincide with a real person.

## Solution

- Treat synthetic data as personal data until a written re-identification assessment says otherwise.
- Do not use synthetic personas to make decisions about real people (credit, hiring, health, education).
- Disclose "simulated, not real respondents" in every report.
- Avoid full names in public outputs; use persona IDs.
- If real data is used for calibration, add consent, a DPIA, and a data processing agreement.

## Verification

- The assessment is written and dated.
- The product copy says "simulated", not "representative".
- Public outputs use IDs, not full names.
- A lawyer reviews the flow before launch in the EU or Vietnam.

## Rule References

- AGENTS.md Rule 5: evidence before assertions.
- AGENTS.md Rule 9: license and commercial boundary.
