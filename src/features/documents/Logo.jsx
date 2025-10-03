// src/features/documents/Logo.jsx
import React from 'react';

// 1) Normalize connector IDs to a canonical key
const norm = (id='') => id.toLowerCase().replace(/[^a-z0-9]/g, '');

// 2) Aliases for common variations (k: normalized input -> normalized brand key)
const ALIASES = {
  // dashes/camel/suffix variants
  googleads: 'googleads',
  facebookads: 'facebook',        // simple-icons uses 'facebook'
  linkedinads: 'linkedin',
  googledrive: 'googledrive',
  googlesheets: 'googlesheets',
  microsoftexcel: 'microsoftexcel',
  microsoftoutlook: 'microsoftoutlook',
  microsoftonedrive: 'microsoftonedrive',
  microsoftsqlserver: 'microsoftsqlserver',
  amazons3: 'amazons3',
  amazonredshift: 'amazonredshift',
  googlebigquery: 'googlebigquery',

  // friendly IDs you might be using
  googleanalytics: 'googleanalytics',
  bigquery: 'googlebigquery',
  redshift: 'amazonredshift',
  s3: 'amazons3',
  sqlserver: 'microsoftsqlserver',
  onedrive: 'microsoftonedrive',
  outlook: 'microsoftoutlook',
  excel: 'microsoftexcel',
  gsheets: 'googlesheets',

  // social ad channels shorthand
  fbads: 'facebook',
  ga4: 'googleanalytics',

  // use brand-specific keys
  netsuite: 'netsuite',
};

// 3) Known simple-icons slugs (normalized key -> slug)
const SIMPLE_ICON_SLUG = {
  // Accounting
  quickbooks: 'quickbooks',
  xero: 'xero',
  sageintacct: 'sage',          // closest public representation
  netsuite: 'netsuite',

  // Payroll
  gusto: 'gusto',
  adp: 'adp',
  rippling: 'rippling',

  // Spreadsheets / Office
  googlesheets: 'googlesheets',
  microsoftexcel: 'microsoftexcel',
  airtable: 'airtable',
  smartsheet: 'smartsheet',

  // CRM
  salesforce: 'salesforce',
  hubspot: 'hubspot',
  pipedrive: 'pipedrive',
  zoho: 'zoho',

  // BI / Database
  snowflake: 'snowflake',
  googlebigquery: 'googlebigquery',
  amazonredshift: 'amazonredshift',
  postgresql: 'postgresql',
  mysql: 'mysql',
  microsoftsqlserver: 'microsoftsqlserver',

  // Subscription / Billing
  stripe: 'stripe',
  chargebee: 'chargebee',
  recurly: 'recurly',
  paddle: 'paddle',
  zuora: 'zuora',

  // Analytics / Ads
  googleanalytics: 'googleanalytics',
  googleads: 'googleads',
  facebook: 'facebook',
  linkedin: 'linkedin',
  mixpanel: 'mixpanel',

  // Mail / Storage
  gmail: 'gmail',
  microsoftoutlook: 'microsoftoutlook',
  googledrive: 'googledrive',
  microsoftonedrive: 'microsoftonedrive',
  dropbox: 'dropbox',
  box: 'box',
  amazons3: 'amazons3',
};

// 4) Brand-ish colors for badge fallback
const BRAND_COLOR = {
  quickbooks:'#2CA01C', xero:'#13B5EA', sageintacct:'#00DC00', netsuite:'#E6202A',
  gusto:'#F45D48', adp:'#E41E26', rippling:'#6B4F4F',
  googlesheets:'#22A565', microsoftexcel:'#217346', airtable:'#18BFFF', smartsheet:'#1F6FEB',
  salesforce:'#00A1E0', hubspot:'#FF7A59', pipedrive:'#2BB24C', zoho:'#C8202F',
  snowflake:'#29B5E8', googlebigquery:'#4285F4', amazonredshift:'#8A2BE2',
  postgresql:'#336791', mysql:'#00758F', microsoftsqlserver:'#A91D22',
  stripe:'#635BFF', chargebee:'#5A31F4', recurly:'#6C5CE7', paddle:'#1F2937', zuora:'#00A3A1',
  googleanalytics:'#EA4335', googleads:'#4285F4', facebook:'#1877F2', linkedin:'#0A66C2', mixpanel:'#6E56CF',
  gmail:'#EA4335', microsoftoutlook:'#0465C8', googledrive:'#1A73E8', microsoftonedrive:'#0078D4',
  dropbox:'#0061FF', box:'#1F70C1', amazons3:'#F06529',

  // Freight / not on simple-icons -> will always be badges (kept for consistent colors)
  cargowise:'#0B5FFF', magaya:'#1D4ED8', descartes:'#0EA5E9', transporeon:'#2563EB', blujay:'#1F3A8A',
  project44:'#0B1E3B', fourkites:'#111827', supplystack:'#334155',
  ecustoms:'#0EA5E9', klearnow:'#0F766E', avalara:'#FF6A00',
  maersk:'#0093D0', msc:'#FFB300', freightos:'#5326FF', inttra:'#1E40AF',
  sftp:'#374151'
};

export function LogoBadge({ id, label }) {
  const k = norm(id);
  const bg = BRAND_COLOR[k] || '#475569';
  return (
    <div
      className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-[11px] font-semibold shadow-sm"
      style={{ background: bg }}
      aria-hidden
    >
      {label || '•'}
    </div>
  );
}

// 5) Robust Logo component: try local -> CDN -> badge
export function Logo({ id, badge, className = 'h-6 w-6' }) {
  const raw = norm(id);
  const key = ALIASES[raw] || raw;
  const slug = SIMPLE_ICON_SLUG[key];

  // Prefer local override if provided later (optional folder)
  const localUrl = `/logos/${key}.svg`;

  const [stage, setStage] = React.useState(slug ? 'local' : 'badge');
  // stages: 'local' -> 'cdn' -> 'badge'

  // Dev tip: log missing icons for aliasing
  if (!slug) console.warn('[Logo] No icon for id:', id, '→ badge fallback');

  if (stage === 'badge') return <LogoBadge id={key} label={badge} />;

  const src =
    stage === 'local'
      ? localUrl
      : `https://cdn.simpleicons.org/${slug}`; // omit color to use brand default

  return (
    <img
      src={src}
      alt=""
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (stage === 'local' && slug) setStage('cdn');
        else setStage('badge');
      }}
    />
  );
}