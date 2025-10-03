import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'

// Brand color mapping
const BRAND = {
  // greens
  quickbooks:'#2CA01C', googleSheets:'#22A565', box:'#1F70C1',
  // blues
  xero:'#13B5EA', snowflake:'#29B5E8', bigquery:'#4285F4', redshift:'#8A2BE2',
  googleDrive:'#1A73E8', onedrive:'#0078D4', dropbox:'#0061FF',
  salesforce:'#00A1E0', hubspot:'#FF7A59', pipedrive:'#2BB24C', zoho:'#C8202F',
  // freight-ish / neutrals
  cargowise:'#0B5FFF', magaya:'#1D4ED8', descartes:'#0EA5E9',
  transop:'#2563EB', blujay:'#1F3A8A', project44:'#0B1E3B', fourkites:'#111827', supplystack:'#334155',
  // customs
  ecustoms:'#0EA5E9', klearnow:'#0F766E', avalara:'#FF6A00',
  // carriers
  maersk:'#0093D0', msc:'#FFB300', freightos:'#5326FF', inttra:'#1E40AF',
  // payroll
  gusto:'#F45D48', adp:'#E41E26', rippling:'#6B4F4F',
  // subs/billing
  stripe:'#635BFF', chargebee:'#5A31F4', recurly:'#6C5CE7', paddle:'#1F2937', zuora:'#00A3A1',
  // analytics/ads
  ga4:'#EA4335', googleAds:'#4285F4', fbAds:'#1877F2', linkedinAds:'#0A66C2', mixpanel:'#6E56CF',
  // dbs
  postgres:'#336791', mysql:'#00758F', sqlserver:'#A91D22',
  // other
  gmail:'#EA4335', outlook:'#0465C8', s3:'#F06529', sftp:'#374151',
};

// Categories
const CATEGORIES = [
  'All',
  'Accounting',
  'Payroll',
  'Spreadsheets',
  'Freight Ops / TMS',
  'Visibility / Tracking',
  'Customs & Trade',
  'Carriers / Marketplaces',
  'CRM',
  'BI/Database',
  'Subscription/Billing',
  'Analytics/Ads',
  'Other',
];

// Seed data
const CONNECTORS = [
  // Accounting
  { id:'quickbooks', badge:'QB', name:'QuickBooks', category:'Accounting', description:'Sync invoices, bills, GL and vendors.' },
  { id:'xero', badge:'X', name:'Xero', category:'Accounting', description:'Bring in journals, contacts and bank feeds.' },
  { id:'sage-intacct', badge:'SI', name:'Sage Intacct', category:'Accounting', description:'Consolidated financials, dimensions and entities.' },
  { id:'netsuite', badge:'NS', name:'NetSuite', category:'Accounting', description:'ERP financials, vendors and transactions.' },

  // Payroll
  { id:'gusto', badge:'G', name:'Gusto', category:'Payroll', description:'Pull payroll runs, headcount and costs.' },
  { id:'adp', badge:'ADP', name:'ADP', category:'Payroll', description:'Import payroll summaries and deductions.' },
  { id:'rippling', badge:'R', name:'Rippling', category:'Payroll', description:'Workforce + payroll sync for allocations.' },

  // Spreadsheets
  { id:'googleSheets', badge:'GS', name:'Google Sheets', category:'Spreadsheets', description:'Import rows from sheets or named ranges.' },
  { id:'excel', badge:'XL', name:'Microsoft Excel', category:'Spreadsheets', description:'Fetch workbooks from OneDrive/SharePoint.' },
  { id:'airtable', badge:'AT', name:'Airtable', category:'Spreadsheets', description:'Tables and attachments for fast intake.' },
  { id:'smartsheet', badge:'SS', name:'Smartsheet', category:'Spreadsheets', description:'Operational sheets with file uploads.' },

  // Freight Ops / TMS
  { id:'cargowise', badge:'CW', name:'CargoWise', category:'Freight Ops / TMS', description:'Forwarding, docs and customs data.' },
  { id:'magaya', badge:'MG', name:'Magaya', category:'Freight Ops / TMS', description:'TMS/WMS shipments, docs and invoices.' },
  { id:'descartes', badge:'DC', name:'Descartes (TMS)', category:'Freight Ops / TMS', description:'Bookings, EDI docs and milestones.' },
  { id:'transop', badge:'TP', name:'Transporeon', category:'Freight Ops / TMS', description:'Assignments, status events and PODs.' },
  { id:'blujay', badge:'BJ', name:'Blue Yonder (BluJay)', category:'Freight Ops / TMS', description:'TMS shipments and documents.' },

  // Visibility / Tracking
  { id:'project44', badge:'44', name:'project44', category:'Visibility / Tracking', description:'Real-time milestones, ETAs and POD docs.' },
  { id:'fourkites', badge:'4K', name:'FourKites', category:'Visibility / Tracking', description:'Multi-modal tracking and delivery docs.' },
  { id:'supplystack', badge:'SS', name:'SupplyStack', category:'Visibility / Tracking', description:'Events, exceptions and delivery proofs.' },

  // Customs & Trade
  { id:'ecustoms', badge:'eC', name:'Descartes eCustoms', category:'Customs & Trade', description:'Declarations, HS codes and filings.' },
  { id:'klearnow', badge:'KN', name:'KlearNow', category:'Customs & Trade', description:'Digital brokerage and clearance docs.' },
  { id:'avalara', badge:'AV', name:'Avalara Tariff & Trade', category:'Customs & Trade', description:'Classification & compliance data.' },

  // Carriers / Marketplaces
  { id:'maersk', badge:'M', name:'Maersk', category:'Carriers / Marketplaces', description:'Bookings, BLs and invoices via API.' },
  { id:'msc', badge:'MSC', name:'MSC', category:'Carriers / Marketplaces', description:'Carrier docs and shipment status.' },
  { id:'freightos', badge:'FW', name:'Freightos WebCargo', category:'Carriers / Marketplaces', description:'eBookings and air waybills.' },
  { id:'inttra', badge:'IN', name:'INTTRA', category:'Carriers / Marketplaces', description:'Ocean booking confirmations and status.' },

  // CRM
  { id:'salesforce', badge:'SF', name:'Salesforce', category:'CRM', description:'Accounts, opportunities and files.' },
  { id:'hubspot', badge:'HS', name:'HubSpot', category:'CRM', description:'Companies, deals and attachments.' },
  { id:'pipedrive', badge:'PD', name:'Pipedrive', category:'CRM', description:'Pipelines, deals and notes.' },
  { id:'zoho', badge:'ZH', name:'Zoho CRM', category:'CRM', description:'Leads, accounts and files.' },

  // BI/Database
  { id:'snowflake', badge:'SF', name:'Snowflake', category:'BI/Database', description:'Query your warehouse for docs & refs.' },
  { id:'bigquery', badge:'BQ', name:'BigQuery', category:'BI/Database', description:'Google Cloud warehouse access.' },
  { id:'redshift', badge:'RS', name:'Redshift', category:'BI/Database', description:'AWS warehouse datasets.' },
  { id:'postgres', badge:'PG', name:'Postgres', category:'BI/Database', description:'Connect to your database schema.' },
  { id:'mysql', badge:'MY', name:'MySQL', category:'BI/Database', description:'Classic OLTP sources.' },
  { id:'sqlserver', badge:'MS', name:'SQL Server', category:'BI/Database', description:'On-prem or Azure SQL.' },

  // Subscription/Billing
  { id:'stripe', badge:'S', name:'Stripe', category:'Subscription/Billing', description:'Invoices, payouts and subscriptions.' },
  { id:'chargebee', badge:'CB', name:'Chargebee', category:'Subscription/Billing', description:'Plans, subscriptions and dunning.' },
  { id:'recurly', badge:'RC', name:'Recurly', category:'Subscription/Billing', description:'Billing and collection events.' },
  { id:'paddle', badge:'PD', name:'Paddle', category:'Subscription/Billing', description:'SaaS checkout + invoices.' },
  { id:'zuora', badge:'ZU', name:'Zuora', category:'Subscription/Billing', description:'Entitlements, subscriptions and AR.' },

  // Analytics/Ads
  { id:'ga4', badge:'GA', name:'Google Analytics (GA4)', category:'Analytics/Ads', description:'Site analytics and conversions.' },
  { id:'googleAds', badge:'Ads', name:'Google Ads', category:'Analytics/Ads', description:'Campaigns, spend and clicks.' },
  { id:'fbAds', badge:'FB', name:'Facebook Ads', category:'Analytics/Ads', description:'Meta campaigns, cost and results.' },
  { id:'linkedinAds', badge:'IN', name:'LinkedIn Ads', category:'Analytics/Ads', description:'Lead gen & spend metrics.' },
  { id:'mixpanel', badge:'MX', name:'Mixpanel', category:'Analytics/Ads', description:'Product events and cohorts.' },

  // Other
  { id:'gmail', badge:'GM', name:'Gmail', category:'Other', description:'Email-to-document ingestion.' },
  { id:'outlook', badge:'OL', name:'Outlook / Office 365', category:'Other', description:'Parse attachments from mailboxes.' },
  { id:'googleDrive', badge:'GD', name:'Google Drive', category:'Other', description:'Sync doc and image files.' },
  { id:'onedrive', badge:'OD', name:'OneDrive / SharePoint', category:'Other', description:'Team document intake.' },
  { id:'dropbox', badge:'DB', name:'Dropbox', category:'Other', description:'Watch folders for new files.' },
  { id:'box', badge:'BX', name:'Box', category:'Other', description:'Enterprise storage and retention.' },
  { id:'s3', badge:'S3', name:'Amazon S3', category:'Other', description:'Bucket-based bulk import.' },
  { id:'sftp', badge:'SFTP', name:'SFTP / FTP', category:'Other', description:'Batch file drops from partners.' },
];

function LogoBadge({ id, label }) {
  const bg = BRAND[id] || '#475569';
  return (
    <div
      className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-sm"
      style={{ background: bg }}
      aria-hidden
    >
      {label}
    </div>
  );
}

function CategoryPill({ category, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(category)}
      className={[
        'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
        isActive 
          ? 'bg-white text-[color:var(--deep-blue)] shadow-sm border border-slate-200/60' 
          : 'bg-transparent text-slate-600 hover:text-[color:var(--deep-blue)] hover:bg-slate-50'
      ].join(' ')}
    >
      {category}
    </button>
  );
}

function ConnectorCard({ connector, onConnect }) {
  return (
    <div className="rounded-xl shadow-soft bg-white border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-6">
      <div className="flex items-start gap-4">
        <LogoBadge id={connector.id} label={connector.badge} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[color:var(--deep-blue)] text-lg mb-2">
            {connector.name}
          </h3>
          <p className="text-slate-600 text-sm mb-4">
            {connector.description}
          </p>
          <button
            onClick={() => onConnect(connector.id)}
            className="bg-[color:var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[color:var(--deep-blue)] transition-colors duration-200 flex items-center gap-2"
          >
            Connect <span>▸</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl shadow-soft bg-white border border-slate-200/60 p-12 text-center">
      <div className="text-slate-400 mb-4">
        <Search size={48} className="mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No connectors found</h3>
        <p className="text-sm text-slate-500">
          Try adjusting your search or selecting a different category.
        </p>
      </div>
    </div>
  );
}

export default function DataSources() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filteredConnectors = useMemo(() => {
    return CONNECTORS.filter(connector => {
      const matchesCategory = activeCategory === 'All' || connector.category === activeCategory;
      const matchesQuery = query === '' || 
        connector.name.toLowerCase().includes(query.toLowerCase()) ||
        connector.description.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const handleConnect = (id) => {
    console.log('connect', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">
            Data sources
          </h1>
          <p className="text-slate-600">
            Connect your business systems to automatically sync documents and data.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search connectors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map(category => (
          <CategoryPill
            key={category}
            category={category}
            isActive={activeCategory === category}
            onClick={setActiveCategory}
          />
        ))}
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnectors.length > 0 ? (
          filteredConnectors.map(connector => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              onConnect={handleConnect}
            />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
}
