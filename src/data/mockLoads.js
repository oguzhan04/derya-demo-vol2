import { LoadStatus, DocumentStatus, TransportMode } from '../types/Load';

// Generate realistic mock loads with complete data structure
export const mockLoads = [
  {
    id: 'LOAD-2024-001',
    route: {
      origin: 'Shanghai',
      destination: 'Los Angeles',
      mode: TransportMode.OCEAN,
      distance: 5500, // nautical miles
      estimatedTransitDays: 18
    },
    cargo: {
      type: 'Electronics',
      value: 85000,
      weight: 15000, // kg
      volume: 25, // CBM
      containers: 1, // TEU
      hazardous: false,
      temperatureControlled: false
    },
    status: LoadStatus.IN_TRANSIT,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    completion: 75,
    documents: {
      billOfLading: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bol-001',
            filename: 'BOL_MAEU123456.pdf',
            uploadedAt: '2024-01-15T10:00:00Z',
            extractedJson: {
              vessel: 'MAERSK SHANGHAI',
              voyage: '001E',
              shipper: 'Shanghai Electronics Co.',
              consignee: 'LA Electronics Inc.',
              notifyParty: 'LA Electronics Inc.',
              portOfLoading: 'Shanghai',
              portOfDischarge: 'Los Angeles',
              freightCharges: 3200,
              currency: 'USD',
              containerNumbers: ['MSKU1234567'],
              sealNumbers: ['SEAL001'],
              cargoDescription: 'Electronic components and devices',
              marksAndNumbers: 'SH/LA-001'
            },
            validationStatus: 'valid',
            fileSize: 245760,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-15T10:00:00Z'
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-001',
            filename: 'Commercial_Invoice_001.pdf',
            uploadedAt: '2024-01-15T10:30:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2024-001',
              invoiceDate: '2024-01-15',
              seller: 'Shanghai Electronics Co.',
              buyer: 'LA Electronics Inc.',
              totalValue: 85000,
              currency: 'USD',
              hsCodes: ['8517.12.00', '8517.62.00'],
              countryOfOrigin: 'China',
              termsOfSale: 'FOB Shanghai',
              paymentTerms: '30 days'
            },
            validationStatus: 'valid',
            fileSize: 189440,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-15T10:30:00Z'
      },
      invoices: {
        status: DocumentStatus.PARTIAL,
        files: [
          {
            id: 'inv-001',
            filename: 'Carrier_Invoice_MAEU.pdf',
            uploadedAt: '2024-01-14T16:00:00Z',
            extractedJson: {
              invoiceNumber: 'MAEU-INV-001',
              invoiceDate: '2024-01-14',
              vendor: 'Maersk Line',
              totalAmount: 3200,
              currency: 'USD',
              lineItems: [
                { description: 'Ocean freight', amount: 2800, quantity: 1 },
                { description: 'Terminal handling', amount: 400, quantity: 1 }
              ],
              dueDate: '2024-02-14',
              paymentStatus: 'pending'
            },
            validationStatus: 'valid',
            fileSize: 156672,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-14T16:00:00Z'
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-001',
            filename: 'Rate_Table_2024_Q1.xlsx',
            uploadedAt: '2024-01-13T09:00:00Z',
            extractedJson: {
              lane: 'Shanghai-Los Angeles',
              baseRate: 2800,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-03-31',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 150, description: 'BAF' },
                { type: 'Currency Adjustment Factor', amount: 50, description: 'CAF' }
              ],
              containerTypes: [
                { type: '20ft', rate: 2800 },
                { type: '40ft', rate: 3200 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 45632,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-13T09:00:00Z'
      },
      quotation: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      booking: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bk-001',
            filename: 'Booking_Confirmation_MAEU.pdf',
            uploadedAt: '2024-01-16T11:00:00Z',
            extractedJson: {
              bookingNumber: 'MAEU-BK-001',
              carrier: 'Maersk Line',
              vessel: 'MAERSK SHANGHAI',
              voyage: '001E',
              sailingDate: '2024-01-20',
              arrivalDate: '2024-02-07',
              containerType: '40ft',
              containerNumbers: ['MSKU1234567'],
              rate: 3200,
              currency: 'USD'
            },
            validationStatus: 'valid',
            fileSize: 198656,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-16T11:00:00Z'
      },
      tracking: {
        status: DocumentStatus.ACTIVE,
        files: [],
        lastUpdated: '2024-01-16T14:30:00Z'
      }
    },
    analysis: {
      riskScore: 0.3,
      predictedCost: 3200,
      predictedTransitDays: 18,
      similarLoads: [
        { id: 'LOAD-2023-045', similarity: 0.85, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-089', similarity: 0.78, outcome: 'delayed_2_days' }
      ],
      alerts: [
        { type: 'route', message: 'Peak season congestion expected at LA port', severity: 'medium' }
      ],
      recommendations: [
        { type: 'cost', message: 'Consider alternative routing via Oakland', impact: 'medium' }
      ]
    }
  },
  {
    id: 'LOAD-2024-002',
    route: {
      origin: 'Hamburg',
      destination: 'New York',
      mode: TransportMode.OCEAN,
      distance: 3200,
      estimatedTransitDays: 12
    },
    cargo: {
      type: 'Automotive Parts',
      value: 125000,
      weight: 22000,
      volume: 35,
      containers: 1,
      hazardous: false,
      temperatureControlled: false
    },
    status: LoadStatus.PLANNING,
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    completion: 40,
    documents: {
      billOfLading: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-002',
            filename: 'Commercial_Invoice_002.pdf',
            uploadedAt: '2024-01-14T14:00:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2024-002',
              invoiceDate: '2024-01-14',
              seller: 'Hamburg Auto Parts GmbH',
              buyer: 'NY Auto Parts Inc.',
              totalValue: 125000,
              currency: 'USD',
              hsCodes: ['8708.99.00'],
              countryOfOrigin: 'Germany',
              termsOfSale: 'FOB Hamburg',
              paymentTerms: '45 days'
            },
            validationStatus: 'valid',
            fileSize: 201728,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-14T14:00:00Z'
      },
      invoices: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-002',
            filename: 'Rate_Table_Hamburg_NY.xlsx',
            uploadedAt: '2024-01-13T11:00:00Z',
            extractedJson: {
              lane: 'Hamburg-New York',
              baseRate: 2400,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-06-30',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 120, description: 'BAF' }
              ],
              containerTypes: [
                { type: '20ft', rate: 2400 },
                { type: '40ft', rate: 2800 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 38912,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-13T11:00:00Z'
      },
      quotation: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'qt-001',
            filename: 'Quote_Hamburg_NY_001.pdf',
            uploadedAt: '2024-01-12T15:00:00Z',
            extractedJson: {
              quoteNumber: 'QT-2024-001',
              quoteDate: '2024-01-12',
              customer: 'NY Auto Parts Inc.',
              totalPrice: 2800,
              currency: 'USD',
              validUntil: '2024-01-19',
              terms: 'FOB Hamburg',
              winLoss: 'won',
              winLossDate: '2024-01-15'
            },
            validationStatus: 'valid',
            fileSize: 123904,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-12T15:00:00Z'
      },
      booking: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      tracking: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      }
    },
    analysis: {
      riskScore: 0.2,
      predictedCost: 2800,
      predictedTransitDays: 12,
      similarLoads: [
        { id: 'LOAD-2023-078', similarity: 0.92, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-102', similarity: 0.88, outcome: 'delivered_on_time' }
      ],
      alerts: [],
      recommendations: [
        { type: 'timing', message: 'Book early for February sailing', impact: 'high' }
      ]
    }
  },
  {
    id: 'LOAD-2024-003',
    route: {
      origin: 'Singapore',
      destination: 'Rotterdam',
      mode: TransportMode.OCEAN,
      distance: 8500,
      estimatedTransitDays: 22
    },
    cargo: {
      type: 'Chemicals',
      value: 200000,
      weight: 18000,
      volume: 28,
      containers: 1,
      hazardous: true,
      temperatureControlled: true
    },
    status: LoadStatus.DELIVERED,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-12T16:00:00Z',
    completion: 100,
    documents: {
      billOfLading: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bol-003',
            filename: 'BOL_Chemicals_003.pdf',
            uploadedAt: '2024-01-10T09:00:00Z',
            extractedJson: {
              vessel: 'MSC SINGAPORE',
              voyage: '003W',
              shipper: 'Singapore Chemicals Ltd.',
              consignee: 'Rotterdam Chemicals BV',
              notifyParty: 'Rotterdam Chemicals BV',
              portOfLoading: 'Singapore',
              portOfDischarge: 'Rotterdam',
              freightCharges: 4200,
              currency: 'USD',
              containerNumbers: ['MSCU9876543'],
              sealNumbers: ['SEAL003'],
              cargoDescription: 'Chemical products - hazardous',
              marksAndNumbers: 'SG/RT-003'
            },
            validationStatus: 'valid',
            fileSize: 267264,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-10T09:00:00Z'
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-003',
            filename: 'Commercial_Invoice_003.pdf',
            uploadedAt: '2024-01-10T09:30:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2024-003',
              invoiceDate: '2024-01-10',
              seller: 'Singapore Chemicals Ltd.',
              buyer: 'Rotterdam Chemicals BV',
              totalValue: 200000,
              currency: 'USD',
              hsCodes: ['2909.19.00', '2909.30.00'],
              countryOfOrigin: 'Singapore',
              termsOfSale: 'FOB Singapore',
              paymentTerms: '30 days'
            },
            validationStatus: 'valid',
            fileSize: 212992,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-10T09:30:00Z'
      },
      invoices: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'inv-003a',
            filename: 'Carrier_Invoice_MSC.pdf',
            uploadedAt: '2024-01-11T10:00:00Z',
            extractedJson: {
              invoiceNumber: 'MSC-INV-003',
              invoiceDate: '2024-01-11',
              vendor: 'MSC Mediterranean',
              totalAmount: 4200,
              currency: 'USD',
              lineItems: [
                { description: 'Ocean freight', amount: 3800, quantity: 1 },
                { description: 'Hazardous surcharge', amount: 400, quantity: 1 }
              ],
              dueDate: '2024-02-11',
              paymentStatus: 'paid'
            },
            validationStatus: 'valid',
            fileSize: 178176,
            mimeType: 'application/pdf'
          },
          {
            id: 'inv-003b',
            filename: 'Terminal_Invoice_Singapore.pdf',
            uploadedAt: '2024-01-11T11:00:00Z',
            extractedJson: {
              invoiceNumber: 'TERM-INV-003',
              invoiceDate: '2024-01-11',
              vendor: 'Singapore Terminal',
              totalAmount: 800,
              currency: 'USD',
              lineItems: [
                { description: 'Terminal handling', amount: 600, quantity: 1 },
                { description: 'Hazardous handling', amount: 200, quantity: 1 }
              ],
              dueDate: '2024-02-11',
              paymentStatus: 'paid'
            },
            validationStatus: 'valid',
            fileSize: 145408,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-11T11:00:00Z'
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-003',
            filename: 'Rate_Table_Singapore_Rotterdam.xlsx',
            uploadedAt: '2024-01-09T08:00:00Z',
            extractedJson: {
              lane: 'Singapore-Rotterdam',
              baseRate: 3800,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-12-31',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 200, description: 'BAF' },
                { type: 'Hazardous Surcharge', amount: 400, description: 'HAZ' }
              ],
              containerTypes: [
                { type: '20ft', rate: 3800 },
                { type: '40ft', rate: 4200 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 51200,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-09T08:00:00Z'
      },
      quotation: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'qt-003',
            filename: 'Quote_Singapore_Rotterdam.pdf',
            uploadedAt: '2024-01-08T14:00:00Z',
            extractedJson: {
              quoteNumber: 'QT-2024-003',
              quoteDate: '2024-01-08',
              customer: 'Rotterdam Chemicals BV',
              totalPrice: 4200,
              currency: 'USD',
              validUntil: '2024-01-15',
              terms: 'FOB Singapore',
              winLoss: 'won',
              winLossDate: '2024-01-09'
            },
            validationStatus: 'valid',
            fileSize: 134144,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-08T14:00:00Z'
      },
      booking: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bk-003',
            filename: 'Booking_Confirmation_MSC.pdf',
            uploadedAt: '2024-01-09T16:00:00Z',
            extractedJson: {
              bookingNumber: 'MSC-BK-003',
              carrier: 'MSC Mediterranean',
              vessel: 'MSC SINGAPORE',
              voyage: '003W',
              sailingDate: '2024-01-12',
              arrivalDate: '2024-02-03',
              containerType: '40ft',
              containerNumbers: ['MSCU9876543'],
              rate: 4200,
              currency: 'USD'
            },
            validationStatus: 'valid',
            fileSize: 189440,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-09T16:00:00Z'
      },
      tracking: {
        status: DocumentStatus.COMPLETED,
        files: [],
        lastUpdated: '2024-01-12T16:00:00Z'
      }
    },
    analysis: {
      riskScore: 0.1,
      predictedCost: 4200,
      predictedTransitDays: 22,
      similarLoads: [
        { id: 'LOAD-2023-156', similarity: 0.95, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-201', similarity: 0.88, outcome: 'delivered_on_time' }
      ],
      alerts: [],
      recommendations: []
    }
  },
  {
    id: 'LOAD-2024-004',
    route: {
      origin: 'Tokyo',
      destination: 'Seattle',
      mode: TransportMode.OCEAN,
      distance: 4500,
      estimatedTransitDays: 14
    },
    cargo: {
      type: 'Automotive Parts',
      value: 95000,
      weight: 12000,
      volume: 20,
      containers: 1,
      hazardous: false,
      temperatureControlled: false
    },
    status: LoadStatus.IN_TRANSIT,
    createdAt: '2024-01-08T06:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    completion: 85,
    documents: {
      billOfLading: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bol-004',
            filename: 'BOL_Tokyo_Seattle.pdf',
            uploadedAt: '2024-01-14T09:00:00Z',
            extractedJson: {
              vessel: 'ONE HARMONY',
              voyage: '004W',
              shipper: 'Tokyo Auto Parts Ltd.',
              consignee: 'Seattle Motors Inc.',
              notifyParty: 'Seattle Motors Inc.',
              portOfLoading: 'Tokyo',
              portOfDischarge: 'Seattle',
              freightCharges: 2800,
              currency: 'USD',
              containerNumbers: ['ONEU9876543'],
              sealNumbers: ['SEAL004'],
              cargoDescription: 'Automotive components and parts',
              marksAndNumbers: 'TK/SE-004'
            },
            validationStatus: 'valid',
            fileSize: 234880,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-14T09:00:00Z'
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-004',
            filename: 'Commercial_Invoice_004.pdf',
            uploadedAt: '2024-01-14T09:30:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2024-004',
              invoiceDate: '2024-01-14',
              seller: 'Tokyo Auto Parts Ltd.',
              buyer: 'Seattle Motors Inc.',
              totalValue: 95000,
              currency: 'USD',
              hsCodes: ['8708.99.00'],
              countryOfOrigin: 'Japan',
              termsOfSale: 'FOB Tokyo',
              paymentTerms: '30 days'
            },
            validationStatus: 'valid',
            fileSize: 198720,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-14T09:30:00Z'
      },
      invoices: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'inv-004',
            filename: 'Carrier_Invoice_ONE.pdf',
            uploadedAt: '2024-01-15T11:00:00Z',
            extractedJson: {
              invoiceNumber: 'ONE-INV-004',
              invoiceDate: '2024-01-15',
              vendor: 'Ocean Network Express',
              totalAmount: 2800,
              currency: 'USD',
              lineItems: [
                { description: 'Ocean freight', amount: 2500, quantity: 1 },
                { description: 'Terminal handling', amount: 300, quantity: 1 }
              ],
              dueDate: '2024-02-15',
              paymentStatus: 'pending'
            },
            validationStatus: 'valid',
            fileSize: 167424,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-15T11:00:00Z'
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-004',
            filename: 'Rate_Table_Tokyo_Seattle.xlsx',
            uploadedAt: '2024-01-12T10:00:00Z',
            extractedJson: {
              lane: 'Tokyo-Seattle',
              baseRate: 2500,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-06-30',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 100, description: 'BAF' }
              ],
              containerTypes: [
                { type: '20ft', rate: 2500 },
                { type: '40ft', rate: 2800 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 42176,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-12T10:00:00Z'
      },
      quotation: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'qt-004',
            filename: 'Quote_Tokyo_Seattle.pdf',
            uploadedAt: '2024-01-11T16:00:00Z',
            extractedJson: {
              quoteNumber: 'QT-2024-004',
              quoteDate: '2024-01-11',
              customer: 'Seattle Motors Inc.',
              totalPrice: 2800,
              currency: 'USD',
              validUntil: '2024-01-18',
              terms: 'FOB Tokyo',
              winLoss: 'won',
              winLossDate: '2024-01-12'
            },
            validationStatus: 'valid',
            fileSize: 145920,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-11T16:00:00Z'
      },
      booking: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bk-004',
            filename: 'Booking_Confirmation_ONE.pdf',
            uploadedAt: '2024-01-13T14:00:00Z',
            extractedJson: {
              bookingNumber: 'ONE-BK-004',
              carrier: 'Ocean Network Express',
              vessel: 'ONE HARMONY',
              voyage: '004W',
              sailingDate: '2024-01-18',
              arrivalDate: '2024-02-01',
              containerType: '40ft',
              containerNumbers: ['ONEU9876543'],
              rate: 2800,
              currency: 'USD'
            },
            validationStatus: 'valid',
            fileSize: 201728,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-13T14:00:00Z'
      },
      tracking: {
        status: DocumentStatus.ACTIVE,
        files: [],
        lastUpdated: '2024-01-16T12:00:00Z'
      }
    },
    analysis: {
      riskScore: 0.2,
      predictedCost: 2800,
      predictedTransitDays: 14,
      similarLoads: [
        { id: 'LOAD-2023-067', similarity: 0.89, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-134', similarity: 0.82, outcome: 'delivered_on_time' }
      ],
      alerts: [],
      recommendations: [
        { type: 'timing', message: 'Monitor weather conditions for Pacific crossing', impact: 'medium' }
      ]
    }
  },
  {
    id: 'LOAD-2024-005',
    route: {
      origin: 'Rotterdam',
      destination: 'New York',
      mode: TransportMode.OCEAN,
      distance: 3200,
      estimatedTransitDays: 12
    },
    cargo: {
      type: 'Machinery',
      value: 180000,
      weight: 25000,
      volume: 40,
      containers: 2,
      hazardous: false,
      temperatureControlled: false
    },
    status: LoadStatus.PLANNING,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
    completion: 35,
    documents: {
      billOfLading: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-005',
            filename: 'Commercial_Invoice_005.pdf',
            uploadedAt: '2024-01-15T11:00:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2024-005',
              invoiceDate: '2024-01-15',
              seller: 'Rotterdam Machinery BV',
              buyer: 'NY Industrial Corp.',
              totalValue: 180000,
              currency: 'USD',
              hsCodes: ['8429.11.00', '8431.10.00'],
              countryOfOrigin: 'Netherlands',
              termsOfSale: 'FOB Rotterdam',
              paymentTerms: '45 days'
            },
            validationStatus: 'valid',
            fileSize: 223232,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-15T11:00:00Z'
      },
      invoices: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-005',
            filename: 'Rate_Table_Rotterdam_NY.xlsx',
            uploadedAt: '2024-01-14T15:00:00Z',
            extractedJson: {
              lane: 'Rotterdam-New York',
              baseRate: 2400,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-12-31',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 120, description: 'BAF' }
              ],
              containerTypes: [
                { type: '20ft', rate: 2400 },
                { type: '40ft', rate: 2800 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 38912,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-14T15:00:00Z'
      },
      quotation: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'qt-005',
            filename: 'Quote_Rotterdam_NY.pdf',
            uploadedAt: '2024-01-14T16:00:00Z',
            extractedJson: {
              quoteNumber: 'QT-2024-005',
              quoteDate: '2024-01-14',
              customer: 'NY Industrial Corp.',
              totalPrice: 2800,
              currency: 'USD',
              validUntil: '2024-01-21',
              terms: 'FOB Rotterdam',
              winLoss: 'won',
              winLossDate: '2024-01-15'
            },
            validationStatus: 'valid',
            fileSize: 156672,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-14T16:00:00Z'
      },
      booking: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      tracking: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      }
    },
    analysis: {
      riskScore: 0.15,
      predictedCost: 2800,
      predictedTransitDays: 12,
      similarLoads: [
        { id: 'LOAD-2023-089', similarity: 0.91, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-156', similarity: 0.87, outcome: 'delivered_on_time' }
      ],
      alerts: [],
      recommendations: [
        { type: 'timing', message: 'Book early for February sailing', impact: 'high' }
      ]
    }
  },
  {
    id: 'LOAD-2024-006',
    route: {
      origin: 'Dubai',
      destination: 'Hamburg',
      mode: TransportMode.OCEAN,
      distance: 4200,
      estimatedTransitDays: 16
    },
    cargo: {
      type: 'Textiles',
      value: 45000,
      weight: 8000,
      volume: 15,
      containers: 1,
      hazardous: false,
      temperatureControlled: false
    },
    status: LoadStatus.DELIVERED,
    createdAt: '2024-01-02T08:00:00Z',
    updatedAt: '2024-01-18T16:00:00Z',
    completion: 100,
    documents: {
      billOfLading: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bol-006',
            filename: 'BOL_Dubai_Hamburg.pdf',
            uploadedAt: '2024-01-08T10:00:00Z',
            extractedJson: {
              vessel: 'MSC DUBAI',
              voyage: '006E',
              shipper: 'Dubai Textiles LLC',
              consignee: 'Hamburg Fashion GmbH',
              notifyParty: 'Hamburg Fashion GmbH',
              portOfLoading: 'Dubai',
              portOfDischarge: 'Hamburg',
              freightCharges: 1800,
              currency: 'USD',
              containerNumbers: ['MSCU4567890'],
              sealNumbers: ['SEAL006'],
              cargoDescription: 'Textile products and garments',
              marksAndNumbers: 'DB/HB-006'
            },
            validationStatus: 'valid',
            fileSize: 198656,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-08T10:00:00Z'
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-006',
            filename: 'Commercial_Invoice_006.pdf',
            uploadedAt: '2024-01-08T10:30:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2024-006',
              invoiceDate: '2024-01-08',
              seller: 'Dubai Textiles LLC',
              buyer: 'Hamburg Fashion GmbH',
              totalValue: 45000,
              currency: 'USD',
              hsCodes: ['6203.42.00', '6204.62.00'],
              countryOfOrigin: 'UAE',
              termsOfSale: 'FOB Dubai',
              paymentTerms: '30 days'
            },
            validationStatus: 'valid',
            fileSize: 178944,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-08T10:30:00Z'
      },
      invoices: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'inv-006',
            filename: 'Carrier_Invoice_MSC.pdf',
            uploadedAt: '2024-01-09T12:00:00Z',
            extractedJson: {
              invoiceNumber: 'MSC-INV-006',
              invoiceDate: '2024-01-09',
              vendor: 'MSC Mediterranean',
              totalAmount: 1800,
              currency: 'USD',
              lineItems: [
                { description: 'Ocean freight', amount: 1600, quantity: 1 },
                { description: 'Terminal handling', amount: 200, quantity: 1 }
              ],
              dueDate: '2024-02-09',
              paymentStatus: 'paid'
            },
            validationStatus: 'valid',
            fileSize: 145408,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-09T12:00:00Z'
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-006',
            filename: 'Rate_Table_Dubai_Hamburg.xlsx',
            uploadedAt: '2024-01-07T09:00:00Z',
            extractedJson: {
              lane: 'Dubai-Hamburg',
              baseRate: 1600,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-12-31',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 100, description: 'BAF' }
              ],
              containerTypes: [
                { type: '20ft', rate: 1600 },
                { type: '40ft', rate: 1800 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 35840,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-07T09:00:00Z'
      },
      quotation: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'qt-006',
            filename: 'Quote_Dubai_Hamburg.pdf',
            uploadedAt: '2024-01-06T14:00:00Z',
            extractedJson: {
              quoteNumber: 'QT-2024-006',
              quoteDate: '2024-01-06',
              customer: 'Hamburg Fashion GmbH',
              totalPrice: 1800,
              currency: 'USD',
              validUntil: '2024-01-13',
              terms: 'FOB Dubai',
              winLoss: 'won',
              winLossDate: '2024-01-07'
            },
            validationStatus: 'valid',
            fileSize: 134144,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-06T14:00:00Z'
      },
      booking: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bk-006',
            filename: 'Booking_Confirmation_MSC.pdf',
            uploadedAt: '2024-01-07T16:00:00Z',
            extractedJson: {
              bookingNumber: 'MSC-BK-006',
              carrier: 'MSC Mediterranean',
              vessel: 'MSC DUBAI',
              voyage: '006E',
              sailingDate: '2024-01-10',
              arrivalDate: '2024-01-26',
              containerType: '40ft',
              containerNumbers: ['MSCU4567890'],
              rate: 1800,
              currency: 'USD'
            },
            validationStatus: 'valid',
            fileSize: 189440,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-07T16:00:00Z'
      },
      tracking: {
        status: DocumentStatus.COMPLETED,
        files: [],
        lastUpdated: '2024-01-18T16:00:00Z'
      }
    },
    analysis: {
      riskScore: 0.1,
      predictedCost: 1800,
      predictedTransitDays: 16,
      similarLoads: [
        { id: 'LOAD-2023-123', similarity: 0.94, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-189', similarity: 0.88, outcome: 'delivered_on_time' }
      ],
      alerts: [],
      recommendations: []
    }
  },
  {
    id: 'LOAD-2024-007',
    route: {
      origin: 'Bangkok',
      destination: 'Miami',
      mode: TransportMode.OCEAN,
      distance: 8500,
      estimatedTransitDays: 25
    },
    cargo: {
      type: 'Food Products',
      value: 35000,
      weight: 5000,
      volume: 12,
      containers: 1,
      hazardous: false,
      temperatureControlled: true
    },
    status: LoadStatus.IN_TRANSIT,
    createdAt: '2024-01-05T07:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    completion: 90,
    documents: {
      billOfLading: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bol-007',
            filename: 'BOL_Bangkok_Miami.pdf',
            uploadedAt: '2024-01-12T08:00:00Z',
            extractedJson: {
              vessel: 'CMA CGM BANGKOK',
              voyage: '007W',
              shipper: 'Bangkok Foods Ltd.',
              consignee: 'Miami Food Distributors',
              notifyParty: 'Miami Food Distributors',
              portOfLoading: 'Bangkok',
              portOfDischarge: 'Miami',
              freightCharges: 2200,
              currency: 'USD',
              containerNumbers: ['CMAU1111111'],
              sealNumbers: ['SEAL007'],
              cargoDescription: 'Frozen food products',
              marksAndNumbers: 'BK/MI-007'
            },
            validationStatus: 'valid',
            fileSize: 201728,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-12T08:00:00Z'
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-007',
            filename: 'Commercial_Invoice_007.pdf',
            uploadedAt: '2024-01-12T08:30:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2024-007',
              invoiceDate: '2024-01-12',
              seller: 'Bangkok Foods Ltd.',
              buyer: 'Miami Food Distributors',
              totalValue: 35000,
              currency: 'USD',
              hsCodes: ['1604.14.00', '1605.20.00'],
              countryOfOrigin: 'Thailand',
              termsOfSale: 'FOB Bangkok',
              paymentTerms: '30 days'
            },
            validationStatus: 'valid',
            fileSize: 167424,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-12T08:30:00Z'
      },
      invoices: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'inv-007',
            filename: 'Carrier_Invoice_CMA.pdf',
            uploadedAt: '2024-01-13T10:00:00Z',
            extractedJson: {
              invoiceNumber: 'CMA-INV-007',
              invoiceDate: '2024-01-13',
              vendor: 'CMA CGM',
              totalAmount: 2200,
              currency: 'USD',
              lineItems: [
                { description: 'Ocean freight', amount: 2000, quantity: 1 },
                { description: 'Reefer surcharge', amount: 200, quantity: 1 }
              ],
              dueDate: '2024-02-13',
              paymentStatus: 'pending'
            },
            validationStatus: 'valid',
            fileSize: 156672,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-13T10:00:00Z'
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-007',
            filename: 'Rate_Table_Bangkok_Miami.xlsx',
            uploadedAt: '2024-01-10T11:00:00Z',
            extractedJson: {
              lane: 'Bangkok-Miami',
              baseRate: 2000,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-12-31',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 100, description: 'BAF' },
                { type: 'Reefer Surcharge', amount: 200, description: 'REEFER' }
              ],
              containerTypes: [
                { type: '20ft Reefer', rate: 2000 },
                { type: '40ft Reefer', rate: 2200 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 38912,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-10T11:00:00Z'
      },
      quotation: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'qt-007',
            filename: 'Quote_Bangkok_Miami.pdf',
            uploadedAt: '2024-01-09T15:00:00Z',
            extractedJson: {
              quoteNumber: 'QT-2024-007',
              quoteDate: '2024-01-09',
              customer: 'Miami Food Distributors',
              totalPrice: 2200,
              currency: 'USD',
              validUntil: '2024-01-16',
              terms: 'FOB Bangkok',
              winLoss: 'won',
              winLossDate: '2024-01-10'
            },
            validationStatus: 'valid',
            fileSize: 145920,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-09T15:00:00Z'
      },
      booking: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bk-007',
            filename: 'Booking_Confirmation_CMA.pdf',
            uploadedAt: '2024-01-11T13:00:00Z',
            extractedJson: {
              bookingNumber: 'CMA-BK-007',
              carrier: 'CMA CGM',
              vessel: 'CMA CGM BANGKOK',
              voyage: '007W',
              sailingDate: '2024-01-15',
              arrivalDate: '2024-02-09',
              containerType: '40ft Reefer',
              containerNumbers: ['CMAU1111111'],
              rate: 2200,
              currency: 'USD'
            },
            validationStatus: 'valid',
            fileSize: 189440,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-11T13:00:00Z'
      },
      tracking: {
        status: DocumentStatus.ACTIVE,
        files: [],
        lastUpdated: '2024-01-16T10:00:00Z'
      }
    },
    analysis: {
      riskScore: 0.25,
      predictedCost: 2200,
      predictedTransitDays: 25,
      similarLoads: [
        { id: 'LOAD-2023-078', similarity: 0.86, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-145', similarity: 0.79, outcome: 'delayed_1_day' }
      ],
      alerts: [
        { type: 'cargo', message: 'Temperature-controlled cargo - monitor reefer status', severity: 'medium' }
      ],
      recommendations: [
        { type: 'monitoring', message: 'Track reefer container temperature throughout voyage', impact: 'high' }
      ]
    }
  },
  {
    id: 'LOAD-2024-008',
    route: {
      origin: 'Melbourne',
      destination: 'Long Beach',
      mode: TransportMode.OCEAN,
      distance: 7000,
      estimatedTransitDays: 20
    },
    cargo: {
      type: 'Wine',
      value: 75000,
      weight: 3000,
      volume: 8,
      containers: 1,
      hazardous: false,
      temperatureControlled: true
    },
    status: LoadStatus.PLANNING,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z',
    completion: 20,
    documents: {
      billOfLading: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      commercialInvoice: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      invoices: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-008',
            filename: 'Rate_Table_Melbourne_LongBeach.xlsx',
            uploadedAt: '2024-01-16T10:00:00Z',
            extractedJson: {
              lane: 'Melbourne-Long Beach',
              baseRate: 1900,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-12-31',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 100, description: 'BAF' },
                { type: 'Reefer Surcharge', amount: 150, description: 'REEFER' }
              ],
              containerTypes: [
                { type: '20ft Reefer', rate: 1900 },
                { type: '40ft Reefer', rate: 2100 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 35840,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-16T10:00:00Z'
      },
      quotation: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      booking: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      },
      tracking: {
        status: DocumentStatus.PENDING,
        files: [],
        lastUpdated: null
      }
    },
    analysis: {
      riskScore: 0.3,
      predictedCost: 2100,
      predictedTransitDays: 20,
      similarLoads: [
        { id: 'LOAD-2023-112', similarity: 0.83, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-167', similarity: 0.77, outcome: 'delayed_2_days' }
      ],
      alerts: [
        { type: 'cargo', message: 'Wine cargo requires temperature control', severity: 'high' }
      ],
      recommendations: [
        { type: 'timing', message: 'Book reefer container early for wine transport', impact: 'high' }
      ]
    }
  },
  {
    id: 'LOAD-2024-009',
    route: {
      origin: 'Singapore',
      destination: 'Hamburg',
      mode: TransportMode.OCEAN,
      distance: 6000,
      estimatedTransitDays: 18
    },
    cargo: {
      type: 'Chemicals',
      value: 120000,
      weight: 15000,
      volume: 25,
      containers: 1,
      hazardous: true,
      temperatureControlled: false
    },
    status: LoadStatus.IN_TRANSIT,
    createdAt: '2024-01-03T12:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    completion: 95,
    documents: {
      billOfLading: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bol-009',
            filename: 'BOL_Singapore_Hamburg.pdf',
            uploadedAt: '2024-01-10T14:00:00Z',
            extractedJson: {
              vessel: 'HAPAG LLOYD SINGAPORE',
              voyage: '009E',
              shipper: 'Singapore Chemicals Ltd.',
              consignee: 'Hamburg Chemical Works',
              notifyParty: 'Hamburg Chemical Works',
              portOfLoading: 'Singapore',
              portOfDischarge: 'Hamburg',
              freightCharges: 3200,
              currency: 'USD',
              containerNumbers: ['HLBU2222222'],
              sealNumbers: ['SEAL009'],
              cargoDescription: 'Chemical products - hazardous',
              marksAndNumbers: 'SG/HB-009',
              imoClass: '3.1',
              unNumber: 'UN1234'
            },
            validationStatus: 'valid',
            fileSize: 245760,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-10T14:00:00Z'
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-009',
            filename: 'Commercial_Invoice_009.pdf',
            uploadedAt: '2024-01-10T14:30:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2024-009',
              invoiceDate: '2024-01-10',
              seller: 'Singapore Chemicals Ltd.',
              buyer: 'Hamburg Chemical Works',
              totalValue: 120000,
              currency: 'USD',
              hsCodes: ['2909.30.00', '2914.11.00'],
              countryOfOrigin: 'Singapore',
              termsOfSale: 'FOB Singapore',
              paymentTerms: '45 days'
            },
            validationStatus: 'valid',
            fileSize: 201728,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-10T14:30:00Z'
      },
      invoices: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'inv-009',
            filename: 'Carrier_Invoice_Hapag.pdf',
            uploadedAt: '2024-01-11T16:00:00Z',
            extractedJson: {
              invoiceNumber: 'HL-INV-009',
              invoiceDate: '2024-01-11',
              vendor: 'Hapag-Lloyd',
              totalAmount: 3200,
              currency: 'USD',
              lineItems: [
                { description: 'Ocean freight', amount: 2800, quantity: 1 },
                { description: 'Hazardous surcharge', amount: 400, quantity: 1 }
              ],
              dueDate: '2024-02-11',
              paymentStatus: 'pending'
            },
            validationStatus: 'valid',
            fileSize: 178944,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-11T16:00:00Z'
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-009',
            filename: 'Rate_Table_Singapore_Hamburg.xlsx',
            uploadedAt: '2024-01-08T13:00:00Z',
            extractedJson: {
              lane: 'Singapore-Hamburg',
              baseRate: 2800,
              currency: 'USD',
              validFrom: '2024-01-01',
              validTo: '2024-12-31',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 150, description: 'BAF' },
                { type: 'Hazardous Surcharge', amount: 400, description: 'HAZMAT' }
              ],
              containerTypes: [
                { type: '20ft', rate: 2800 },
                { type: '40ft', rate: 3200 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 40960,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2024-01-08T13:00:00Z'
      },
      quotation: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'qt-009',
            filename: 'Quote_Singapore_Hamburg.pdf',
            uploadedAt: '2024-01-07T17:00:00Z',
            extractedJson: {
              quoteNumber: 'QT-2024-009',
              quoteDate: '2024-01-07',
              customer: 'Hamburg Chemical Works',
              totalPrice: 3200,
              currency: 'USD',
              validUntil: '2024-01-14',
              terms: 'FOB Singapore',
              winLoss: 'won',
              winLossDate: '2024-01-08'
            },
            validationStatus: 'valid',
            fileSize: 156672,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-07T17:00:00Z'
      },
      booking: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bk-009',
            filename: 'Booking_Confirmation_Hapag.pdf',
            uploadedAt: '2024-01-09T15:00:00Z',
            extractedJson: {
              bookingNumber: 'HL-BK-009',
              carrier: 'Hapag-Lloyd',
              vessel: 'HAPAG LLOYD SINGAPORE',
              voyage: '009E',
              sailingDate: '2024-01-12',
              arrivalDate: '2024-01-30',
              containerType: '40ft',
              containerNumbers: ['HLBU2222222'],
              rate: 3200,
              currency: 'USD'
            },
            validationStatus: 'valid',
            fileSize: 201728,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2024-01-09T15:00:00Z'
      },
      tracking: {
        status: DocumentStatus.ACTIVE,
        files: [],
        lastUpdated: '2024-01-16T11:00:00Z'
      }
    },
    analysis: {
      riskScore: 0.4,
      predictedCost: 3200,
      predictedTransitDays: 18,
      similarLoads: [
        { id: 'LOAD-2023-134', similarity: 0.92, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-201', similarity: 0.85, outcome: 'delayed_1_day' }
      ],
      alerts: [
        { type: 'cargo', message: 'Hazardous cargo - ensure proper documentation', severity: 'high' }
      ],
      recommendations: [
        { type: 'safety', message: 'Verify IMDG compliance and emergency procedures', impact: 'high' }
      ]
    }
  },
  {
    id: 'LOAD-2024-010',
    route: {
      origin: 'Hamburg',
      destination: 'New York',
      mode: TransportMode.OCEAN,
      distance: 3500,
      estimatedTransitDays: 12
    },
    cargo: {
      type: 'Steel Products',
      value: 200000,
      weight: 50000,
      volume: 60,
      containers: 3,
      hazardous: false,
      temperatureControlled: false
    },
    status: LoadStatus.DELIVERED,
    createdAt: '2023-12-20T10:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
    completion: 100,
    documents: {
      billOfLading: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bol-010',
            filename: 'BOL_Hamburg_NY.pdf',
            uploadedAt: '2023-12-28T11:00:00Z',
            extractedJson: {
              vessel: 'MSC HAMBURG',
              voyage: '010W',
              shipper: 'Hamburg Steel Works',
              consignee: 'NY Steel Importers',
              notifyParty: 'NY Steel Importers',
              portOfLoading: 'Hamburg',
              portOfDischarge: 'New York',
              freightCharges: 4500,
              currency: 'USD',
              containerNumbers: ['MSCU3333333', 'MSCU4444444', 'MSCU5555555'],
              sealNumbers: ['SEAL010A', 'SEAL010B', 'SEAL010C'],
              cargoDescription: 'Steel products and components',
              marksAndNumbers: 'HB/NY-010'
            },
            validationStatus: 'valid',
            fileSize: 267264,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2023-12-28T11:00:00Z'
      },
      commercialInvoice: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'ci-010',
            filename: 'Commercial_Invoice_010.pdf',
            uploadedAt: '2023-12-28T11:30:00Z',
            extractedJson: {
              invoiceNumber: 'INV-2023-010',
              invoiceDate: '2023-12-28',
              seller: 'Hamburg Steel Works',
              buyer: 'NY Steel Importers',
              totalValue: 200000,
              currency: 'USD',
              hsCodes: ['7214.20.00', '7216.10.00'],
              countryOfOrigin: 'Germany',
              termsOfSale: 'FOB Hamburg',
              paymentTerms: '30 days'
            },
            validationStatus: 'valid',
            fileSize: 223232,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2023-12-28T11:30:00Z'
      },
      invoices: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'inv-010',
            filename: 'Carrier_Invoice_MSC_Steel.pdf',
            uploadedAt: '2023-12-29T13:00:00Z',
            extractedJson: {
              invoiceNumber: 'MSC-INV-010',
              invoiceDate: '2023-12-29',
              vendor: 'MSC Mediterranean',
              totalAmount: 4500,
              currency: 'USD',
              lineItems: [
                { description: 'Ocean freight (3x40ft)', amount: 4200, quantity: 3 },
                { description: 'Terminal handling', amount: 300, quantity: 3 }
              ],
              dueDate: '2024-01-29',
              paymentStatus: 'paid'
            },
            validationStatus: 'valid',
            fileSize: 189440,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2023-12-29T13:00:00Z'
      },
      rateTable: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'rt-010',
            filename: 'Rate_Table_Hamburg_NY.xlsx',
            uploadedAt: '2023-12-25T14:00:00Z',
            extractedJson: {
              lane: 'Hamburg-New York',
              baseRate: 1400,
              currency: 'USD',
              validFrom: '2023-12-01',
              validTo: '2024-11-30',
              surcharges: [
                { type: 'Bunker Adjustment Factor', amount: 100, description: 'BAF' }
              ],
              containerTypes: [
                { type: '20ft', rate: 1400 },
                { type: '40ft', rate: 1500 }
              ]
            },
            validationStatus: 'valid',
            fileSize: 37888,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        ],
        lastUpdated: '2023-12-25T14:00:00Z'
      },
      quotation: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'qt-010',
            filename: 'Quote_Hamburg_NY.pdf',
            uploadedAt: '2023-12-24T16:00:00Z',
            extractedJson: {
              quoteNumber: 'QT-2023-010',
              quoteDate: '2023-12-24',
              customer: 'NY Steel Importers',
              totalPrice: 4500,
              currency: 'USD',
              validUntil: '2023-12-31',
              terms: 'FOB Hamburg',
              winLoss: 'won',
              winLossDate: '2023-12-25'
            },
            validationStatus: 'valid',
            fileSize: 167424,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2023-12-24T16:00:00Z'
      },
      booking: {
        status: DocumentStatus.COMPLETED,
        files: [
          {
            id: 'bk-010',
            filename: 'Booking_Confirmation_MSC_Steel.pdf',
            uploadedAt: '2023-12-26T18:00:00Z',
            extractedJson: {
              bookingNumber: 'MSC-BK-010',
              carrier: 'MSC Mediterranean',
              vessel: 'MSC HAMBURG',
              voyage: '010W',
              sailingDate: '2023-12-30',
              arrivalDate: '2024-01-11',
              containerType: '40ft',
              containerNumbers: ['MSCU3333333', 'MSCU4444444', 'MSCU5555555'],
              rate: 4500,
              currency: 'USD'
            },
            validationStatus: 'valid',
            fileSize: 223232,
            mimeType: 'application/pdf'
          }
        ],
        lastUpdated: '2023-12-26T18:00:00Z'
      },
      tracking: {
        status: DocumentStatus.COMPLETED,
        files: [],
        lastUpdated: '2024-01-15T16:00:00Z'
      }
    },
    analysis: {
      riskScore: 0.05,
      predictedCost: 4500,
      predictedTransitDays: 12,
      similarLoads: [
        { id: 'LOAD-2023-089', similarity: 0.96, outcome: 'delivered_on_time' },
        { id: 'LOAD-2023-156', similarity: 0.91, outcome: 'delivered_on_time' }
      ],
      alerts: [],
      recommendations: []
    }
  }
];

// Helper function to get load by ID
export const getLoadById = (id) => {
  return mockLoads.find(load => load.id === id);
};

// Helper function to get all loads
export const getAllLoads = () => {
  return mockLoads;
};

// Helper function to get loads by status
export const getLoadsByStatus = (status) => {
  return mockLoads.filter(load => load.status === status);
};
