# AlsoAsked documentation style

This guide tells you how to write the AlsoAsked API documentation. It applies to the guide pages and to every `description`, `title`, and `summary` field in the OpenAPI source (`src/`).

## Readers

The documentation has three types of reader:

1. People with limited technical knowledge who want to do one task.
2. Developers who integrate the AlsoAsked API.
3. LLMs that read the documentation for one of these people.

Many readers don't have English as their first language. An LLM often gets one section without the rest of the page. Write so that each of these readers gets the right meaning the first time.

## Basis

This guide builds on the [Google developer documentation style guide](https://developers.google.com/style). If this guide doesn't cover something, follow Google's guide. If the two guides disagree, this guide wins.

On top of Google's guide, this guide adds four things:

- **The termbase** (`style/termbase.yaml`): one approved term for each concept.
- **Page types and templates** (`style/templates/`).
- **Rules for LLM readers**: each section must be correct on its own.
- **Code, number, and Markdown conventions** for the AlsoAsked API.

The team chose this basis after a pilot that compared it with a Simplified Technical English (STE) style. Both styles scored the same with LLM readers. The team preferred the Google-style page, which was shorter and easier to read.

## Voice and sentences

- Write to the reader as `you`. Don't write "the user" or "the developer".
- Use active voice. Name who does the action: `the API returns`, `AlsoAsked sends`, `you set`.
- Don't use "we" for AlsoAsked in the docs. Write `AlsoAsked` or `the API`, so the reader always knows which system acts.
- Use present tense.
- Keep sentences short. Split a sentence that has more than one main idea. As a guide, read again any sentence with more than 25 words.
- Use common contractions, such as `don't`, `isn't`, and `you're`. Don't use less common ones, such as `there'd` or `it'll`.
- Avoid phrasal verbs when a single verb works: `start`, not `kick off`. `Set up`, `log in`, and `sign in` are fine.
- Don't use idioms, slang, jokes, or marketing words, such as `seamless`, `powerful`, or `out of the box`.
- Keep hedges that carry meaning. If a fact isn't certain, keep the word that says so (`may`, `can`). Don't change `the search may fail` to `the search fails`.
- Use US English and the serial comma: `a, b, and c`.

## Words

- Use the approved term from `style/termbase.yaml` for each concept, every time. Don't use a synonym to avoid repetition. The glossary (`docs/glossary.md`) lists every term.
- Use each word in one meaning. `Request` always means an HTTP request, so don't use it as a verb.
- Prefer the common word: `use`, not `utilize`; `start`, not `commence`; `get`, not `obtain`.
- Write an abbreviation in full the first time on each page: `Coordinated Universal Time (UTC)`. You don't need to do this for `API`, `HTTP`, `JSON`, and `URL`.

## Code and API names

- Put each code name in code font: field names, parameter names, header names, enum values, endpoints, file names, and values.
- Add a noun after the code name, so the reader knows what it is: `the depth field`, `the X-Api-Key header`, `the page query parameter`, `the success status`.
- Write an endpoint as the method and the full path: `POST /v1.1/search`.
- Write a status code with its name the first time in a section: `429 Too Many Requests`. After that, the number is enough.
- Write `true`, `false`, and `null` in code font, in lowercase.
- Don't use a code name as a verb.

## Numbers, units, dates, and times

- Use digits for all numbers: `3 terms`, `5 minutes`.
- Use a comma for thousands: `1,000`.
- Write units in full: `90 seconds`, `5 minutes`.
- Write ranges with `to`: `1 to 3`.
- All times are in UTC. In examples, write a date and time in ISO 8601 format: `2026-01-31T12:00:00Z`.

## Sections for LLM readers

An LLM often gets one section without the page around it. Each section must be correct on its own.

- **Name things in full in each section.** Write `the depth field in the POST /v1.1/search request body` the first time in a section, not `this field`.
- **Don't refer to other text by its position.** Don't write `see above`, `as mentioned earlier`, or `as described in the next section`. Link to the section by name.
- **Don't use `it`, `this`, or `they` for something in an earlier sentence** if two things could match. Repeat the noun.
- **Write complete examples.** A request example has the method, the full URL, the headers, and the full body. It runs as written, except for the API key.
- **Use text, not images, for steps.** A screenshot can show a step, but it can't replace the text.
- **Use headings that say what the section contains.** Write `Rate limit headers`, not `More information`.
- **Don't add facts that the code doesn't support.** Before you write a page, list its facts from the code.

## Page types

Each page has one type. Use the template for the type.

| Type | Purpose | Template |
| --- | --- | --- |
| Quickstart | The reader completes a first task, from start to finish. | `style/templates/quickstart.md` |
| Task | The reader does one task. | `style/templates/task.md` |
| Reference | The reader finds one fact: a field, a header, an error. | `style/templates/reference.md` |
| Concept | The reader learns how something works and when to use it. | `style/templates/concept.md` |

OpenAPI `description` fields are reference text. Keep them short and factual.

## Markdown format

The docs don't depend on one platform.

- Use CommonMark with GitHub tables and fenced code blocks. Give each code block a language: `json`, `bash`, `php`.
- Start each page with front matter: `title`, `description` (one sentence), and `type` (`quickstart`, `task`, `reference`, or `concept`).
- Use GitHub alerts for notes and warnings: `> [!NOTE]`, `> [!WARNING]`. Use them only for information that the reader must not miss.
- Don't use tabs. Write the live API example and the sandbox API example as two sections.
- Use relative links to Markdown files: `./rate-limiting.md#rate-limit-headers`.
- Use sentence case for headings: `Verify a webhook signature`.

## Enforcement

| Who checks | What |
| --- | --- |
| Vale, error (blocks the commit) | Termbase synonyms (`AlsoAsked.Terms`), position references (`AlsoAsked.SelfContained`), spelling (`Vale.Spelling`) |
| Vale, Google package | Google's own rules at their default levels, for example `Google.We`, `Google.Passive` and `Google.Will` |
| LLM review | One meaning for each word, clear pronouns, sections that are correct on their own, hedges kept |
| Human review | The facts agree with the code. The examples run. The page follows its template. |

Vale can't check the meaning of a sentence. A page with no Vale errors can still break a rule.

## Change this guide

To change a rule or a term, open a pull request that changes this file or `style/termbase.yaml`. Give the reason in the pull request description. Run `npm run style` to regenerate the term rule and the glossary.
