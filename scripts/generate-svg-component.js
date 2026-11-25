const fs = require('fs');

let svg = fs.readFileSync('public/bangladesh-map-exact.svg', 'utf8');

// Remove enable-background inline style from svg tag
svg = svg.replace(/style="enable-background:new[^"]*"/g, '');

// Remove xlink:href="#" when href already exists on <a> tag
svg = svg.replace(/\s+xlink:href="#"/g, '');

// Replace attributes for JSX
let jsx = svg
  .replace(/xmlns:xlink=/g, 'xmlnsXlink=')
  .replace(/xml:space=/g, 'xmlSpace=')
  .replace(/xlink:href=/g, 'href=')
  .replace(/enable-background=/g, 'enableBackground=')
  .replace(/stroke-width=/g, 'strokeWidth=')
  .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
  .replace(/stroke-linecap=/g, 'strokeLinecap=')
  .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
  .replace(/fill-rule=/g, 'fillRule=')
  .replace(/clip-rule=/g, 'clipRule=')
  .replace(/stop-color/g, 'stopColor')
  .replace(/stop-opacity/g, 'stopOpacity')
  .replace(/class=/g, 'className=')
  .replace(/<style type="text\/css">([\s\S]*?)<\/style>/g, (match, p1) => {
    return `<style dangerouslySetInnerHTML={{ __html: \`${p1}\` }} />`;
  });

// Handle style="stop-color:#000000" etc.
jsx = jsx.replace(/style="([^"]*)"/g, (match, styleStr) => {
  const rules = styleStr.split(';').filter(r => r.trim());
  const obj = {};
  rules.forEach(rule => {
    const [k, v] = rule.split(':');
    if (k && v) {
      const camelKey = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      obj[camelKey] = v.trim();
    }
  });
  return `style={${JSON.stringify(obj)}}`;
});

// Remove any remaining `<a>` inside division groups or make them preventDefault
jsx = jsx.replace(/<a\s+href="[^"]*"\s*>/g, '<g className="division-item cursor-pointer">');
jsx = jsx.replace(/<\/a>/g, '</g>');

const tsx = `'use client';

import React from 'react';

interface BangladeshExactSvgMapProps {
  onSelectDivision?: (divisionName: string) => void;
  selectedDivision?: string;
}

export default function BangladeshExactSvgMap({ onSelectDivision, selectedDivision }: BangladeshExactSvgMapProps) {
  const handleDivisionClick = (banglaName: string) => {
    if (onSelectDivision) {
      onSelectDivision(banglaName);
    }
  };

  return (
    <div className="w-full relative flex justify-center items-center py-2">
      ${jsx
        .replace('<svg ', '<svg className="w-full h-auto max-h-[500px] drop-shadow-sm select-none" ')
        .replace(/id="rangpur"/g, 'id="rangpur" onClick={() => handleDivisionClick("রংপুর")} className="cursor-pointer transition-transform hover:scale-[1.01]"')
        .replace(/id="sylhet"/g, 'id="sylhet" onClick={() => handleDivisionClick("সিলেট")} className="cursor-pointer transition-transform hover:scale-[1.01]"')
        .replace(/id="khulna"/g, 'id="khulna" onClick={() => handleDivisionClick("খুলনা")} className="cursor-pointer transition-transform hover:scale-[1.01]"')
        .replace(/id="dhaka"/g, 'id="dhaka" onClick={() => handleDivisionClick("ঢাকা")} className="cursor-pointer transition-transform hover:scale-[1.01]"')
        .replace(/id="mymensingh"/g, 'id="mymensingh" onClick={() => handleDivisionClick("ময়মনসিংহ")} className="cursor-pointer transition-transform hover:scale-[1.01]"')
        .replace(/id="rajshahi"/g, 'id="rajshahi" onClick={() => handleDivisionClick("রাজশাহী")} className="cursor-pointer transition-transform hover:scale-[1.01]"')
        .replace(/id="borishal"/g, 'id="borishal" onClick={() => handleDivisionClick("বরিশাল")} className="cursor-pointer transition-transform hover:scale-[1.01]"')
        .replace(/id="chittagong"/g, 'id="chittagong" onClick={() => handleDivisionClick("চট্টগ্রাম")} className="cursor-pointer transition-transform hover:scale-[1.01]"')
      }
    </div>
  );
}
`;

fs.writeFileSync('components/news/BangladeshExactSvgMap.tsx', tsx);
console.log('Successfully re-generated components/news/BangladeshExactSvgMap.tsx');
