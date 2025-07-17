import * as React from "react";
import { JSX } from "react/jsx-runtime";

const DocSvg = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
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
        fill: "#2B569A",
      }}
      d="M48.037,56H7.963C7.155,56,6.5,55.345,6.5,54.537V39h43v15.537C49.5,55.345,48.845,56,48.037,56z"
    />
    <g>
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M19.379,48.105L21.936,53h-1.9l-1.6-3.801h-0.137L16.576,53h-1.9l2.557-4.895l-2.721-5.182h1.873l1.777,4.102 h0.137l1.928-4.102h1.873L19.379,48.105z"
      />
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M31.998,42.924h1.668V53h-1.668v-6.932l-2.256,5.605h-1.449l-2.27-5.605V53h-1.668V42.924h1.668 l2.994,6.891L31.998,42.924z"
      />
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M37.863,42.924v8.832h4.635V53h-6.303V42.924H37.863z"
      />
    </g>
    <path
      style={{
        fill: "#C8BDB8",
      }}
      d="M23.5,16v-4h-12v4v2v2v2v2v2v2v2v4h10h2h21v-4v-2v-2v-2v-2v-2v-4H23.5z M13.5,14h8v2h-8V14z M13.5,18h8v2h-8V18z M13.5,22h8v2h-8V22z M13.5,26h8v2h-8V26z M21.5,32h-8v-2h8V32z M42.5,32h-19v-2h19V32z M42.5,28h-19v-2h19V28z M42.5,24h-19v-2h19V24z M23.5,20v-2h19v2H23.5z"
    />
  </svg>
);

export default DocSvg;
