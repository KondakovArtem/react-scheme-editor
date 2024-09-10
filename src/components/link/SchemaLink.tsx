import { FC, memo, useRef } from "react";
import {
  type SchemaEditorNodeLink,
  type SchemaEditorNodeLinkDraft,
} from "../../models";
import "./SchemaNode.scss";

export interface SchemaEditorLinkProps {
  data: SchemaEditorNodeLink;
  draft?: SchemaEditorNodeLinkDraft;
  showPoints?: boolean;
  selected?: boolean;
}

export const SchemaLink: FC<SchemaEditorLinkProps> = memo(({ data }) => {
  const path = "";
  const pathHandleRef = useRef<SVGPathElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  function getMarkerStart() {
    return "123";
  }
  function getMarkerEnd() {
    return "321";
  }

  return (
    <div className="schema-editor__link__container">
      <svg style={{ display: path ? "inherit" : "none" }}>
        <path
          ref={pathHandleRef}
          className="cursor-pointer node-link-path-handle"
          d=""
        ></path>
        <path
          ref={pathRef}
          className={[
            "node-link-path",
            data?.lineType === "dashed" ? "dashed" : "",
          ].join(" ")}
          marker-start={getMarkerStart()}
          marker-end={getMarkerEnd()}
          d=""
        ></path>
        {/* <defs>
            <marker
                [attr.id]="getMarkerStartId()"
                [attr.markerWidth]="width"
                [attr.markerHeight]="height"
                markerUnits="userSpaceOnUse"
                [attr.refX]="refX"
                [attr.refY]="refY"
                orient="auto-start-reverse"
                [attr.viewBox]="arrowViewBox"
                class="arrow-marker"
            >
                <ng-container *ngTemplateOutlet="getStartArrow()"></ng-container>
            </marker>
            <marker
                [attr.id]="getMarkerEndId()"
                [attr.markerWidth]="width"
                [attr.markerHeight]="height"
                markerUnits="userSpaceOnUse"
                [attr.refX]="refX"
                [attr.refY]="refY"
                orient="auto-start-reverse"
                [attr.viewBox]="arrowViewBox"
                class="arrow-marker"
            >
                <ng-container *ngTemplateOutlet="getEndArrow()"></ng-container>
            </marker>
        </defs> */}
      </svg>
    </div>
  );
});

SchemaLink.displayName = "SchemaLink";
