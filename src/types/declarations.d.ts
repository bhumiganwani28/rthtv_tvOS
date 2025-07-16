declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.json';

// Allow importing css/style files
declare module '*/styles' {
  const content: { [className: string]: string };
  export default content;
}

// Allow importing style files
declare module '*/styles.ts' {
  const content: { [className: string]: string };
  export default content;
} 