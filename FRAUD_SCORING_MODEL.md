# Fraud Scoring Model

## Scores

The system produces five scores:

- Document Fraud Score
- Application Consistency Score
- Financial Crime Risk Score
- Extraction Confidence Score
- Overall Recommendation Score

## Calibration

All scores are marked `HEURISTIC_UNCALIBRATED`. No historical labelled outcome dataset exists yet, so the system does not claim statistical calibration.

## Inputs

Scores are based on:

- evidence-backed red flags
- severity
- confidence
- flag status
- evidence count
- extraction confidence
- critical penalties

## Recommendation

The overall recommendation is decomposable:

- 35% document fraud
- 35% application consistency
- 15% financial crime risk
- 15% extraction uncertainty

Financial crime risk is kept separate from document fraud. AML/PEP/sanctions indicators should not automatically equal document forgery.

