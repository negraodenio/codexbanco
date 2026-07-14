# Evidence Graph

## Purpose

The evidence graph connects applications, documents, extracted claims, contradictions, red flags, rules, models, and decisions.

## Current Node Types

- Application
- Document
- NIF
- IBAN
- Address
- FinancialValue
- Employer
- Claim
- RedFlag

The type model also supports Page, Person, Organization, Evidence, Rule, Model, Decision, and HumanReviewer.

## Current Edge Types

- CONTAINS
- ASSERTS
- SUPPORTS
- CONTRADICTS
- GENERATED

The type model also supports EXTRACTED_FROM, MATCHES, BELONGS_TO, REVIEWED_BY, OVERRIDES, and DECIDED_BY.

## Storage

The first version stores graph nodes and edges relationally through `graph_nodes` and `graph_edges` in Supabase. No graph database is required for this version.

