# TRACE — AI Architecture

## Role

TRACE uses AI as an investigation-assistance layer for search, explanation, summarization and analysis. AI output is not the authoritative source of evidence.

## Controlled Tool Gateway

The current documented gateway exposes nine read-only investigation tools:

1. `search_cases`
2. `get_case`
3. `search_entities`
4. `inspect_entity`
5. `find_cross_case_links`
6. `get_relationship`
7. `get_evidence_metadata`
8. `get_case_timeline`
9. `analyze_case`

## Trust Boundary

```text
System Policy
     |
     v
Tool Authorization
     |
     v
AI Request
     |
     v
Approved Read-only Tool
     |
     v
Structured Investigation Data
     |
     v
AI Explanation
```

The audit evidence states that the AI gateway has zero access to shell execution, arbitrary SQL, file modification and external network requests.

## Evidence Isolation

Evidence is treated as untrusted data. Evidence text is demarcated at an untrusted boundary and is not automatically evaluated as executable system instructions.

## Negative Results

The documented audit confirms that non-existent identifiers return clean negative results rather than fabricated data.

## Human Oversight

AI assists an authorized investigator. It does not independently modify evidence or make final investigative determinations.
