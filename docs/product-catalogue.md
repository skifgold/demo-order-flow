# Product Catalogue

This document defines the deterministic Artwork data and pricing rules used by
the frontend and mock HTTP interface.

## Catalogue

The application uses GBP. Catalogue cards display **From £…**, calculated from
the lowest supported Print-only Matte price.

| ID | Artwork | Category | Print-only Matte prices | Available quantity |
| --- | --- | --- | --- | ---: |
| `modern-geometry-07` | Modern Geometry No. 7 | Abstract | A4 £35 · A3 £55 · A2 £80 | 8 |
| `botanical-study-01` | Botanical Study I | Botanical | A4 £38 · A3 £58 | 5 |
| `coastal-light` | Coastal Light | Landscape | A3 £60 · A2 £85 | 4 |
| `concrete-angles` | Concrete Angles | Architecture | A4 £36 · A3 £56 · A2 £81 | 6 |
| `night-reflections` | Night Reflections | Cityscape | A4 £40 · A3 £60 | 3 |
| `cote-d-azur` | Côte d’Azur | Vintage Travel | A3 £55 · A2 £80 | 7 |

An Artwork's supported sizes are derived from its price-by-size data rather
than stored as a second list.

## Configuration modifiers

| Selection | Price adjustment |
| --- | ---: |
| Matte paper | Included |
| Lustre paper | +£5 |
| Framed A4 | +£40 |
| Framed A3 | +£55 |
| Framed A2 | +£80 |
| Black or White frame | Included |
| Natural oak frame | +£10 |
| Glass glazing | Included |
| Acrylic glazing | +£8 |
| Standard shipping | £6.95 |
| Express shipping | £12.95 |

All stored and calculated monetary values use integer minor units. For example,
£35.00 is represented as `3500`.

## Capability rules

- Every Artwork supports Print only and Framed print.
- Every Basket Item requires one of its Artwork's supported sizes and either
  Matte or Lustre paper.
- A Framed print additionally requires Black, White, or Natural oak framing and
  Glass or Acrylic glazing.
- An A2 Framed print supports Acrylic glazing only.
- Standard shipping is always available.
- Express shipping is available only when every Basket Item is Print only and
  uses A4 or A3.
- Gift Options are free and include a message of at most 200 characters and an
  optional **Hide prices on packing slip** choice.

## Images

Each Artwork uses a generated, locally bundled image in `public/artwork` that
matches its category. The README credits both AI assistance and the generated
imagery. The application does not depend on a remote image service at runtime.
