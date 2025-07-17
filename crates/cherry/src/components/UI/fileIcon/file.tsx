import * as React from "react";
import { JSX } from "react/jsx-runtime";
const fileSvg = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    enableBackground="new 0 0 48 48"
    {...props}
  >
    <polygon fill="#90CAF9" points="40,45 8,45 8,3 30,3 40,13" />
    <polygon fill="#E1F5FE" points="38.5,14 29,14 29,4.5" />
  </svg>
);
export default fileSvg;
