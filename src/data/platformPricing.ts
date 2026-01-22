// src/data/platformPricing.ts
export type PricingTierKey = 'free' | 'freemium' | 'paid' | 'enterprise';

export interface PricingTier {
  id: string;
  key: PricingTierKey;
  name: string;
  price?: string;
  billing?: string;
  features?: string[];
  ctaUrl?: string;
}

export const platformPricing: Record<string, PricingTier[]> = {
  lovable: [
    {
      id: 'lovable-free',
      key: 'free',
      name: 'Free',
      price: '$0',
      billing: 'forever',
      features: ['Basic components', 'Community templates', 'Viewer links'],
      ctaUrl: 'https://lovable.dev/pricing'
    },
    {
      id: 'lovable-pro',
      key: 'paid',
      name: 'Pro',
      price: '$9',
      billing: 'per editor/month',
      features: ['Unlimited projects', 'Team libraries', 'Export code', 'Priority support'],
      ctaUrl: 'https://lovable.dev/pricing'
    },
    {
      id: 'lovable-enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Contact Sales',
      features: ['SSO', 'Admin controls', 'SLA & onboarding'],
      ctaUrl: 'https://lovable.dev/contact'
    }
  ],

  windsurf: [
    {
      id: 'windsurf-trial',
      key: 'freemium',
      name: 'Free Trial',
      price: '$0',
      billing: 'trial',
      features: ['Limited AI runs', 'Community templates'],
      ctaUrl: 'https://windsurf.dev/pricing'
    },
    {
      id: 'windsurf-pro',
      key: 'paid',
      name: 'Pro',
      price: '$29',
      billing: 'per user/month',
      features: ['Higher AI quota', 'Private projects', 'Priority support'],
      ctaUrl: 'https://windsurf.dev/pricing'
    },
    {
      id: 'windsurf-enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Contact Sales',
      features: ['On-prem / VPC', 'SAML/SSO', 'Dedicated support'],
      ctaUrl: 'https://windsurf.dev/contact'
    }
  ],

  replit: [
    {
      id: 'replit-free',
      key: 'free',
      name: 'Free',
      price: '$0',
      billing: 'forever',
      features: ['Public repls', 'Basic workspace', 'Community support'],
      ctaUrl: 'https://replit.com/pricing'
    },
    {
      id: 'replit-hacker',
      key: 'paid',
      name: 'Hacker',
      price: '$7',
      billing: 'per month',
      features: ['Private repls', 'Faster containers', 'Increased memory'],
      ctaUrl: 'https://replit.com/pricing'
    },
    {
      id: 'replit-teams',
      key: 'enterprise',
      name: 'Teams / Enterprise',
      price: 'Contact Sales',
      features: ['Team management', 'Org billing', 'SAML/SSO'],
      ctaUrl: 'https://replit.com/teams'
    }
  ],

  bolt: [
    {
      id: 'bolt-free',
      key: 'free',
      name: 'Free',
      price: '$0',
      billing: 'forever',
      features: ['Single app', 'Basic DB', 'Community templates'],
      ctaUrl: 'https://bolt.com/pricing'
    },
    {
      id: 'bolt-team',
      key: 'paid',
      name: 'Team',
      price: '$25',
      billing: 'per user/month',
      features: ['Multiple apps', 'Access control', 'API integrations'],
      ctaUrl: 'https://bolt.com/pricing'
    },
    {
      id: 'bolt-enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Contact Sales',
      features: ['Advanced roles', 'SLA', 'Dedicated support'],
      ctaUrl: 'https://bolt.com/contact'
    }
  ],

  'github-copilot': [
    {
      id: 'copilot-individual',
      key: 'paid',
      name: 'Individual',
      price: '$10',
      billing: 'per month',
      features: ['AI code suggestions', 'IDE integrations'],
      ctaUrl: 'https://github.com/features/copilot#pricing'
    },
    {
      id: 'copilot-business',
      key: 'enterprise',
      name: 'Business / Enterprise',
      price: 'Contact Sales',
      features: ['Admin controls', 'Org billing', 'SSO'],
      ctaUrl: 'https://github.com/contact'
    }
  ],

  cursor: [
    {
      id: 'cursor-free',
      key: 'freemium',
      name: 'Free',
      price: '$0',
      billing: 'limited',
      features: ['Basic AI features', 'Community plans'],
      ctaUrl: 'https://cursor.sh/pricing'
    },
    {
      id: 'cursor-pro',
      key: 'paid',
      name: 'Pro',
      price: '$15',
      billing: 'per month',
      features: ['Faster AI', 'Longer contexts', 'Priority support'],
      ctaUrl: 'https://cursor.sh/pricing'
    },
    {
      id: 'cursor-enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Contact Sales',
      features: ['Team seats', 'SAML/SSO', 'Dedicated onboarding'],
      ctaUrl: 'https://cursor.sh/enterprise'
    }
  ],

  'claude-code': [
    {
      id: 'claude-trial',
      key: 'freemium',
      name: 'Free Trial',
      price: '$0',
      billing: 'trial',
      features: ['Limited usage', 'Docs & examples'],
      ctaUrl: 'https://www.anthropic.com/'
    },
    {
      id: 'claude-pro',
      key: 'paid',
      name: 'Pay-as-you-go',
      price: 'Usage-based',
      billing: 'per request',
      features: ['Higher throughput', 'Priority access'],
      ctaUrl: 'https://www.anthropic.com/pricing'
    },
    {
      id: 'claude-enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Contact Sales',
      features: ['Dedicated instances', 'Compliance & security', 'SLA'],
      ctaUrl: 'https://www.anthropic.com/contact'
    }
  ],

  'gemini-cli': [
    {
      id: 'gemini-open',
      key: 'free',
      name: 'Open Source',
      price: '$0',
      billing: 'open-source',
      features: ['Local CLI', 'Community driven'],
      ctaUrl: 'https://github.com/google-gemini/gemini-cli'
    },
    {
      id: 'gemini-cloud',
      key: 'paid',
      name: 'Cloud',
      price: 'Usage-based',
      billing: 'per request',
      features: ['Managed infra', 'Higher rate limits'],
      ctaUrl: 'https://cloud.google.com/gemini/pricing'
    },
    {
      id: 'gemini-enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Contact Sales',
      features: ['SAML/SSO', 'Enterprise SLAs', 'Dedicated support'],
      ctaUrl: 'https://cloud.google.com/contact'
    }
  ],

  figma: [
    {
      id: 'figma-free',
      key: 'free',
      name: 'Free',
      price: '$0',
      billing: 'forever',
      features: ['3 projects', 'Community plugins', 'Viewer links'],
      ctaUrl: 'https://www.figma.com/pricing'
    },
    {
      id: 'figma-professional',
      key: 'paid',
      name: 'Professional',
      price: '$12',
      billing: 'per editor/month',
      features: ['Unlimited projects', 'Shared libraries', 'Version history'],
      ctaUrl: 'https://www.figma.com/pricing'
    },
    {
      id: 'figma-organization',
      key: 'enterprise',
      name: 'Organization',
      price: 'Contact Sales',
      features: ['SSO', 'Admin controls', 'Org policies'],
      ctaUrl: 'https://www.figma.com/pricing'
    }
  ],
  base44: [
    {
      id: 'base44-free',
      key: 'free',
      name: 'Free',
      price: '$0',
      billing: 'forever',
      features: ['25 Message Credits, 100 Integration Credits','Core Base44 features'],
      ctaUrl: 'https://base44.com/pricing'
    },
    {
      id: 'base44-start',
      key: 'paid',
      name: 'Starter',
      price: '$9',
      billing: 'per month',
      features: ['100 Message Credits, 2000 Integration Credits','Unlimited number of apps', 'In-app code edits'],
      ctaUrl: 'https://base44.com/pricing'
    },
    {
      id: 'base44-Builder',
      key: 'paid',
      name: 'Builder',
      price: '$40',
      billing: 'per month',
      features: ['250 Message Credits, 10,000 Integration Credits','Backend functions', 'Connect a domain', 'Free domain for 1 year', 'Github integration'],
      ctaUrl: 'https://base44.com/contact'
    },
    {
      id: 'base44-Pro',
      key: 'paid',
      name: 'Pro',
      price: '$80',
      billing: 'per month',
      features: ['500 Message Credits, 20,000 Integration Credits','Prior Features', 'Early access to beta features'],
      ctaUrl: 'https://base44.com/contact'
    },
    {
      id: 'base44-Elite',
      key: 'paid',
      name: 'Elite',
      price: '$160',
      billing: 'per month',
      features: ['1,200 Message Credits, 50,000 Integration Credits','Prior Features', 'Premium support'],
      ctaUrl: 'https://base44.com/contact'
    }
  ],
  grok: [
    {
      id: 'grok-basic',
      key: 'free',
      name: 'Basic',
      price: '$0',
      billing: 'per month',
      features: [
        'Limited access to chat models',
        'Limited context memory',
        'Aurora image model',
        'Voice access',
        'Projects',
        'Tasks'
      ],
      ctaUrl: 'https://grok.com/plans'
    },
    {
      id: 'grok-supergrok',
      key: 'paid',
      name: 'SuperGrok',
      price: '$30',
      billing: 'per month',
      features: [
        'Increased access to Grok 4.1',
        'Improved reasoning and search capabilities',
        'Extended memory (128,000 tokens)',
        'Priority voice access',
        'Imagine image model',
        'Companions: Ani and Valentine',
        'Everything in Basic'
      ],
      ctaUrl: 'https://grok.com/plans'
    },
    {
      id: 'grok-supergrok-heavy',
      key: 'paid',
      name: 'SuperGrok Heavy',
      price: '$300',
      billing: 'per month',
      features: [
        'Exclusive preview of Grok 4 Heavy',
        'Extended access to Grok 4.1',
        'Longest memory (256,000 tokens)',
        'Early access to new features',
        'Everything in SuperGrok'
      ],
      ctaUrl: 'https://grok.com/plans'
    }
  ],

  v0: [
    {
      id: 'v0-individual-free',
      key: 'free',
      name: 'Free',
      price: '$0',
      billing: 'per month',
      features: [
        '$5 of included monthly credits',
        'Deploy apps to Vercel',
        'Edit visually with Design Mode',
        'Sync with GitHub',
        '7 messages/day limit'
      ],
      ctaUrl: 'https://v0.app/pricing'
    },
    {
      id: 'v0-individual-premium',
      key: 'paid',
      name: 'Premium',
      price: '$20',
      billing: 'per month',
      features: [
        '$20 of included monthly credits',
        '$2 of free daily credits on login',
        'Purchase additional credits outside of your monthly usage',
        '5x higher attachment size limits',
        'Import from Figma'
      ],
      ctaUrl: 'https://v0.app/pricing'
    },
    {
      id: 'v0-team',
      key: 'paid',
      name: 'Team',
      price: '$30',
      billing: 'per user / month',
      features: [
        '$30 of included monthly credits per user',
        '$2 of free daily credits on login per user',
        'Purchase additional credits outside of your monthly usage (shared across team)',
        'Centralized billing on vercel.com',
        'Share chats and collaborate with your team'
      ],
      ctaUrl: 'https://v0.app/pricing'
    },
    {
      id: 'v0-business',
      key: 'paid',
      name: 'Business',
      price: '$100',
      billing: 'per user / month',
      features: [
        '$30 of included monthly credits per user',
        '$2 of free daily credits on login per user',
        'Training opt-out by default',
        'Purchase additional credits outside of your monthly usage (shared across team)',
        'Centralized billing on vercel.com',
        'Share chats and collaborate with your team'
      ],
      ctaUrl: 'https://v0.app/pricing'
    },
    {
      id: 'v0-enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      billing: 'custom',
      features: [
        'Training opt-out by default',
        'SAML SSO',
        'Role-based access control',
        'Priority access (better performance, no queues)',
        'Guaranteed customer support SLAs'
      ],
      ctaUrl: 'https://v0.app/pricing'
    }
  ],
    webflow: [
    {
      id: 'webflow-starter',
      key: 'free',
      name: 'Starter',
      price: '$0',
      billing: 'free',
      features: ['Webflow.io domain', '2 pages', '20 CMS collections', '50 CMS items', 'Webflow AI'],
      ctaUrl: 'https://webflow.com/pricing'
    },
    {
      id: 'webflow-basic',
      key: 'paid',
      name: 'Basic',
      price: '$14',
      billing: 'per month (billed yearly)',
      features: ['Custom domain', '150 pages', 'No CMS features', 'Webflow AI'],
      ctaUrl: 'https://webflow.com/pricing'
    },
    {
      id: 'webflow-cms',
      key: 'paid',
      name: 'CMS',
      price: '$23',
      billing: 'per month (billed yearly)',
      features: ['Custom domain', '150 pages', '20 CMS collections', '2,000 CMS items', 'Webflow AI'],
      ctaUrl: 'https://webflow.com/pricing'
    },
    {
      id: 'webflow-business',
      key: 'paid',
      name: 'Business',
      price: '$39',
      billing: 'per month (billed yearly)',
      features: ['Custom domain', '300 pages', '40 CMS collections', 'Up to 10,000 CMS items', 'Webflow AI'],
      ctaUrl: 'https://webflow.com/pricing'
    }
  ],


  'abacus-ai': [
    {
      id: 'abacus-ai-basic',
      key: 'paid',
      name: 'Basic',
      price: '$10',
      billing: 'per user/month',
      features: [
        'Access to all ChatLLM features',
        '20K credits per month included',
        'Limited access to Abacus AI Deep Agent (3 basic tasks/month)',
        'Access to multiple top LLMs (GPT, Claude, Gemini, etc.)'
      ],
      ctaUrl: 'https://abacus.ai/help/chatllm-ai-super-assistant/faqs/billing'
    },
    {
      id: 'abacus-ai-pro',
      key: 'paid',
      name: 'Pro',
      price: '$20',
      billing: 'per user/month',
      features: [
        'Everything in Basic, plus a more powerful Deep Agent',
        'Unrestricted use of Abacus AI Deep Agent (while you have credits)',
        'Extra 5K credits per month (total 25K+ if you include rollover purchases)',
        'Best for heavy Deep Agent usage and app creation'
      ],
      ctaUrl: 'https://abacus.ai/help/chatllm-ai-super-assistant/faqs/billing'
    },
    {
      id: 'abacus-ai-enterprise',
      key: 'enterprise',
      name: 'Enterprise',
      price: 'Contact Sales',
      billing: 'custom billing',
      features: [
        'Abacus.AI Enterprise platform with advanced security and compliance',
        'Custom contracts and SLAs',
        'Dedicated support and onboarding',
        'Advanced enterprise features and integrations'
      ],
      ctaUrl: 'https://abacus.ai/contact'
    }
  ]
};