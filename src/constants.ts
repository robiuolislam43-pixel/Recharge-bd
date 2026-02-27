import { Operator } from './types';

export const OPERATOR_DATA: Record<Operator, { name: string; logo: string; color: string; bg: string; brandColor: string }> = {
  'Grameenphone': { 
    name: 'Grameenphone',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Grameenphone_Logo.svg',
    color: 'text-[#00AEEF]',
    bg: 'bg-[#00AEEF]',
    brandColor: '#00AEEF'
  },
  'Robi/Airtel': { 
    name: 'Robi/Airtel',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Robi_Logo.svg',
    color: 'text-[#E21F26]',
    bg: 'bg-[#E21F26]',
    brandColor: '#E21F26'
  },
  'Banglalink': { 
    name: 'Banglalink',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Banglalink_logo.svg',
    color: 'text-[#F37021]',
    bg: 'bg-[#F37021]',
    brandColor: '#F37021'
  },
  'Teletalk': { 
    name: 'Teletalk',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Teletalk_logo.svg',
    color: 'text-[#4CAF50]',
    bg: 'bg-[#4CAF50]',
    brandColor: '#4CAF50'
  }
};
