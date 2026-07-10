# AI Workflow — HireLoop AI

## Overview

The AI Engine uses **LangGraph** to orchestrate a multi-agent pipeline for resume processing, candidate analysis, and intelligent matching.

---

## LangGraph Agent Pipeline

```
                    ┌─────────────┐
                    │  START       │
                    │  (PDF Input) │
                    └──────┬──────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Resume Parser  │
                  │  Agent          │
                  │                 │
                  │  • Extract text │
                  │  • Parse with   │
                  │    LLM          │
                  │  • Return JSON  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Candidate      │
                  │  Analyzer       │
                  │                 │
                  │  • Experience   │
                  │    level        │
                  │  • Career path  │
                  │  • Strengths    │
                  │  • Gaps         │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Skill          │
                  │  Extractor      │
                  │                 │
                  │  • Technical    │
                  │    skills       │
                  │  • Soft skills  │
                  │  • Proficiency  │
                  │    levels       │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Role Matcher   │
                  │                 │
                  │  • Compare to   │
                  │    open roles   │
                  │  • Score match  │
                  │  • Rank roles   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Recommendation │
                  │  Agent          │
                  │                 │
                  │  • Hire/Pass    │
                  │  • Confidence   │
                  │  • Reasoning    │
                  └────────┬────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  END          │
                    │  (JSON Output)│
                    └──────────────┘
```

---

## Provider Pattern

The Provider Pattern allows swapping LLM providers without changing business logic.

```
┌────────────────────────────────────┐
│         Provider Factory           │
│                                    │
│  get_provider(name) → BaseProvider │
└──────────┬────────────┬────────────┘
           │            │
           ▼            ▼
┌──────────────┐  ┌─────────────────┐
│   Gemini     │  │  HuggingFace    │
│   Provider   │  │  Provider       │
│              │  │                 │
│  • generate()│  │  • generate()   │
│  • embed()   │  │  • embed()      │
└──────────────┘  └─────────────────┘
```

### Adding a New Provider

1. Create `providers/new_provider.py`
2. Implement `BaseProvider` interface
3. Register in `provider_factory.py`
4. Set `LLM_PROVIDER=new_provider` in env

**That's it. Zero other files change.**

---

## Graph State Schema

```python
class ResumeProcessingState(TypedDict):
    # Input
    raw_text: str
    file_name: str

    # Resume Parser output
    parsed_resume: dict        # Structured JSON
    parse_confidence: float

    # Candidate Analyzer output
    analysis: dict             # Experience level, career path, strengths
    experience_years: int

    # Skill Extractor output
    skills: list[dict]         # [{name, category, proficiency}]

    # Role Matcher output
    role_matches: list[dict]   # [{role_id, score, reasoning}]

    # Recommendation output
    recommendation: dict       # {decision, confidence, reasoning}

    # Metadata
    errors: list[str]
    processing_time: float
```

---

## Embedding Strategy

| Component | Technology |
|-----------|-----------|
| Model | `all-MiniLM-L6-v2` (Sentence Transformers) |
| Vector Size | 384 dimensions |
| Storage | PostgreSQL + pgvector |
| Distance | Cosine similarity |
| Index | IVFFlat (for production scale) |

### What Gets Embedded

- Resume full text → candidate embedding
- Skills list → skills embedding
- Job role description → role embedding

### Semantic Search Flow

```
User query → Generate embedding
                → pgvector cosine similarity search
                → Return top-K candidates
                → Merge with keyword results
                → Rank and return
```

---

## Feedback Summarization

When an interviewer submits feedback, the AI engine can:

1. Summarize multiple feedback entries into a cohesive overview
2. Extract key themes (technical strength, communication, culture fit)
3. Generate a recommendation based on all feedback

```
POST /api/v1/summarize-feedback
Body: { feedbacks: [...] }
Response: {
  summary: "...",
  themes: [...],
  recommendation: "..."
}
```

---

## Error Handling

Each agent node has built-in error handling:

- If an LLM call fails → retry with exponential backoff (max 3 attempts)
- If parsing fails → return partial results with error flag
- If a node fails → graph continues with available data, marks errors
- All errors are logged with full context for debugging

---

## Performance Considerations

| Concern | Solution |
|---------|----------|
| LLM latency | Async processing, streaming responses |
| Embedding computation | Batch processing, cache common queries |
| Large PDFs | Chunked extraction, page limits |
| Provider rate limits | Queue-based processing, provider rotation |
| Cold starts | Keep model loaded in memory |
