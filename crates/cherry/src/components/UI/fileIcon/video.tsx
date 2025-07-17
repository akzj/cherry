import * as React from "react";
import { JSX } from "react/jsx-runtime";

const VideoSvg = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    width="800px"
    height="800px"
    viewBox="0 0 56 56"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      style={{
        fill: "#E9E9E0",
      }}
      d="M36.985,0H7.963C7.155,0,6.5,0.655,6.5,1.926V55c0,0.345,0.655,1,1.463,1h40.074 c0.808,0,1.463-0.655,1.463-1V12.978c0-0.696-0.093-0.92-0.257-1.085L37.607,0.257C37.442,0.093,37.218,0,36.985,0z"
    />
    <polygon
      style={{
        fill: "#D9D7CA",
      }}
      points="37.5,0.151 37.5,12 49.349,12"
    />
    <path
      style={{
        fill: "#0096E6",
      }}
      d="M48.037,56H7.963C7.155,56,6.5,55.345,6.5,54.537V39h43v15.537C49.5,55.345,48.845,56,48.037,56z"
    />
    <g>
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M16.361,53l3.527-10.063h1.627L24.963,53h-1.718l-0.775-2.383h-3.787L17.907,53H16.361z M19.101,49.245h2.773 l-0.996-3.088c-0.086-0.25-0.154-0.555-0.205-0.913c-0.045,0.268-0.113,0.567-0.205,0.898L19.101,49.245z"
      />
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M32.414,53h-4.511V42.924h1.668v8.832h2.843V53z"
      />
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M38.525,53h-1.668V42.924h1.668V53z"
      />
    </g>
    <polygon
      style={{
        fill: "#C8BDB8",
      }}
      points="28.5,19 28.5,22 20.5,22 20.5,34 35.5,34 35.5,22 35.5,19 31.5,19"
    />
    <polygon
      style={{
        fill: "#C8BDB8",
      }}
      points="30.5,19 30.5,8 25.5,8 25.5,19 20.5,19 28,26.5 35.5,19"
    />
  </svg>
);

export default VideoSvg;
