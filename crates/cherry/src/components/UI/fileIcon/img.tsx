import * as React from "react";
import { JSX } from "react/jsx-runtime";

const ImgSvg = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
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
        fill: "#5CD1A9",
      }}
      d="M48.037,56H7.963C7.155,56,6.5,55.345,6.5,54.537V39h43v15.537C49.5,55.345,48.845,56,48.037,56z"
    />
    <g>
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M21.037,42.924c0.628,0,1.13,0.516,1.13,1.13c0,0.506-0.361,0.931-0.847,1.066v2.833 c0,0.167-0.133,0.3-0.3,0.3h-0.084c-0.167,0-0.3-0.133-0.3-0.3v-2.833c-0.486-0.135-0.847-0.56-0.847-1.066 C19.79,43.44,20.409,42.924,21.037,42.924z"
      />
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M25.501,42.924c0.469,0,0.9,0.084,1.294,0.254s0.737,0.403,1.028,0.7c0.291,0.297,0.519,0.653,0.684,1.067 c0.165,0.414,0.247,0.863,0.247,1.347s-0.082,0.934-0.247,1.347c-0.165,0.414-0.394,0.771-0.684,1.067 c-0.291,0.297-0.635,0.528-1.028,0.696c-0.394,0.167-0.825,0.251-1.294,0.251c-0.469,0-0.9-0.084-1.294-0.251 s-0.737-0.399-1.028-0.696c-0.291-0.297-0.519-0.653-0.684-1.067c-0.165-0.413-0.247-0.863-0.247-1.347s0.082-0.934,0.247-1.347 c0.165-0.414,0.394-0.77,0.684-1.067c0.291-0.297,0.635-0.529,1.028-0.7C24.601,43.008,25.033,42.924,25.501,42.924z M25.501,48.592c0.724,0,1.304-0.225,1.741-0.675c0.438-0.45,0.656-1.043,0.656-1.778c0-0.735-0.219-1.326-0.656-1.774 c-0.438-0.448-1.018-0.672-1.741-0.672s-1.303,0.225-1.741,0.672c-0.438,0.448-0.656,1.039-0.656,1.774 c0,0.735,0.218,1.328,0.656,1.778C24.198,48.367,24.777,48.592,25.501,48.592z"
      />
      <path
        style={{
          fill: "#FFFFFF",
        }}
        d="M35.875,43.924v1.121h-3.008V53h-1.654v-8.955h-3.008v-1.121H35.875z"
      />
    </g>
    <path
      style={{
        fill: "#D9D7CA",
      }}
      d="M39.5,30h-24V14h24V30z M17.5,28h20V16h-20V28z"
    />
    <circle
      style={{
        fill: "#D9D7CA",
      }}
      cx="24.5" cy="21" r="3"
    />
    <path
      style={{
        fill: "#D9D7CA",
      }}
      d="M31.5,18l-3,5l-2-1l-4.464,5.464L23.5,28h14L31.5,18z"
    />
  </svg>
);

export default ImgSvg;
