import { SchemaEditorNodeLinkArrow } from "../../models";

export function arrowNone() {
  return <path d="M0 7L28 7" />;
}

export function arrowOne() {
  return (
    <>
      <path d="M0 7L28 7" />
      <path d="M21 0V14" />
    </>
  );
}

export function arrowMany() {
  return (
    <>
      <path d="M0 7H28" />
      <path d="M14 7L28 0" />
      <path d="M14 7L28 14" />
    </>
  );
}

export function arrowOneAndOnlyOne() {
  return (
    <>
      <path d="M0 7L28 7" />
      <path d="M20.9999 0V14" />
      <path d="M15 0V14" />
    </>
  );
}

export function arrowZeroOrOne() {
  return (
    <>
      <path d="M13.0667 7L28 7" />
      <path d="M21 0V14" />
      <circle cx="7" cy="7" r="6" />
    </>
  );
}

export function arrowOneOrMany() {
  return (
    <>
      <path d="M0 7H28" />
      <path d="M14 7L28 0" />
      <path d="M14 7L28 14" />
      <path d="M7 1V14" />
    </>
  );
}

export function arrowTerminate() {
  return (
    <>
      <path d="M0 7L28 7" />
      <path d="M13 2L23 12" />
      <path d="M23 1.99997L13 12" />
    </>
  );
}

export function arrowInnerClass() {
  return (
    <>
      <circle cx="21" cy="7" r="6" />
      <path d="M0 7H27.0667" />
      <path d="M21 13.5333V0.466675" />
    </>
  );
}

export function arrowFoundMessage() {
  return (
    <>
      <path
        d="M28 7C28 9.76142 25.7614 12 23 12C20.2386 12 18 9.76142 18 7C18 4.23858 20.2386 2 23 2C25.7614 2 28 4.23858 28 7Z"
        className="filled"
      />
      <path d="M0 6.99994H27.0667" />
    </>
  );
}

export function arrowDefault() {
  return (
    <>
      <path d="M0 7L25.6667 7.00002" />
      <path d="M17 12L26 7C26 7 20.1952 3.95262 17 2" strokeLinecap="square" />
    </>
  );
}

export function arrowOutlinedTriangle() {
  return (
    <>
      <path d="M0 7H16.8" />
      <path d="M17 2.61804L25.7639 7.00003L17 11.382L17 2.61804Z" />
    </>
  );
}

export function arrowTriangle() {
  return (
    <>
      <path d="M0 7H16.8" />
      <path d="M28 7.00003L16 13L16 0.999999L28 7.00003Z" className="filled" />
    </>
  );
}

export function arrowAggregation() {
  return (
    <>
      <path d="M0 7L11.6667 7" />
      <path d="M18.5 11.8173L10.8727 7.00003L18.5 2.18278L26.1273 6.99998L18.5 11.8173Z" />
    </>
  );
}

export function arrowComposition() {
  return (
    <>
      <path d="M0 7L11.6667 7" />
      <path
        d="M9 6.99997L18.5 1.00003L28 6.99997L18.5 13L9 6.99997Z"
        className="filled"
      />
    </>
  );
}

export function arrowControlLifeline() {
  return (
    <>
      <path d="M27 7.4C26.7939 10.5272 24.1893 13 21.0066 13C17.6892 13 15 10.3137 15 7C15 3.68629 17.6892 1 21.0066 1C23.1331 1 25.0015 2.10386 26.0689 3.76923" />
      <path d="M0 7H14.4667" />
      <path
        d="M29.2854 8.6468L27.1676 6.53882L24.6461 8.14229"
        strokeLinecap="square"
      />
    </>
  );
}

export function arrowEntityLifeline() {
  return (
    <>
      <path d="M27 7.4C26.7939 10.5272 24.1893 13 21.0066 13C17.6892 13 15 10.3137 15 7C15 3.68629 17.6892 1 21.0066 1C23.1331 1 25.0015 2.10386 26.0689 3.76923" />
      <path d="M0 7H14.4667" />
      <path
        d="M29.2854 8.6468L27.1676 6.53882L24.6461 8.14229"
        strokeLinecap="square"
      />
    </>
  );
}

export function arrowBoundaryLifeline() {
  return (
    <>
      <path d="M0 7H16.8" />
      <path d="M28 1L16 1" />
      <circle cx="22" cy="8" r="5" />
    </>
  );
}

export function arrowZeroOrMany() {
  return (
    <>
      <circle cx="7" cy="7" r="6" />
      <path d="M14 7H28" />
      <path d="M14 7L28 0" />
      <path d="M14 7L28 14" />
    </>
  );
}

export const arrows = {
  [SchemaEditorNodeLinkArrow.arrowNone]: arrowNone,
  [SchemaEditorNodeLinkArrow.arrowOne]: arrowOne,
  [SchemaEditorNodeLinkArrow.arrowMany]: arrowMany,
  [SchemaEditorNodeLinkArrow.arrowOneAndOnlyOne]: arrowOneAndOnlyOne,
  [SchemaEditorNodeLinkArrow.arrowZeroOrOne]: arrowZeroOrOne,
  [SchemaEditorNodeLinkArrow.arrowOneOrMany]: arrowOneOrMany,
  [SchemaEditorNodeLinkArrow.arrowZeroOrMany]: arrowZeroOrMany,
  [SchemaEditorNodeLinkArrow.arrowTerminate]: arrowTerminate,
  [SchemaEditorNodeLinkArrow.arrowInnerClass]: arrowInnerClass,
  [SchemaEditorNodeLinkArrow.arrowFoundMessage]: arrowFoundMessage,
  [SchemaEditorNodeLinkArrow.arrowDefault]: arrowDefault,
  [SchemaEditorNodeLinkArrow.arrowOutlinedTriangle]: arrowOutlinedTriangle,
  [SchemaEditorNodeLinkArrow.arrowTriangle]: arrowTriangle,
  [SchemaEditorNodeLinkArrow.arrowAggregation]: arrowAggregation,
  [SchemaEditorNodeLinkArrow.arrowComposition]: arrowComposition,
  [SchemaEditorNodeLinkArrow.arrowControlLifeline]: arrowControlLifeline,
  [SchemaEditorNodeLinkArrow.arrowEntityLifeline]: arrowEntityLifeline,
  [SchemaEditorNodeLinkArrow.arrowBoundaryLifeline]: arrowBoundaryLifeline,
};
