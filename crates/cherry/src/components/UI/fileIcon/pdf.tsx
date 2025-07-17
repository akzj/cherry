import * as React from "react";
import { JSX } from "react/jsx-runtime";
const pdfSvg = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      style={{
        fill: "#ffffff",
        stroke: "none",
      }}
      d="m 65,3 0,19 19,0 z"
    />
    <path
      style={{
        fill: "#EBEBDA",
        stroke: "#777777",
        strokeWidth: 2,
      }}
      d="m 65,3 0,19 19,0 0,74 -72,0 0,-93 53,0 19,19"
    />
    <path
      style={{
        fill: "none",
        stroke: "#C01A1A",
        strokeWidth: 4,
      }}
      d="m 49,56 c -17,4 -27,10 -29,14 -2,4 -1,9 6,4 7,-5 20,-32 23,-53 1,-7 -7,-11 -7,-2 0,12 6,34 30,41 9,2 10,-7 0,-7 -10,0 -23,3 -23,3 z"
    />
  </svg>
);
export default pdfSvg;
