import { Operator } from './types';

export const OPERATOR_DATA: Record<Operator, { name: string; logo: string; color: string; bg: string; brandColor: string }> = {
  'Grameenphone': { 
    name: 'Grameenphone',
    logo: 'https://ais-pre-fnfsghjjan77r3umaolc6z-49638028205.asia-east1.run.app/api/files/67c2cd8b-213c-497d-9806-64673898687a',
    color: 'text-[#00AEEF]',
    bg: 'bg-[#00AEEF]',
    brandColor: '#00AEEF'
  },
  'Robi': { 
    name: 'Robi',
    logo: 'https://ais-pre-fnfsghjjan77r3umaolc6z-49638028205.asia-east1.run.app/api/files/67c2db1b-213c-497d-9806-64673898687a',
    color: 'text-[#E21F26]',
    bg: 'bg-[#E21F26]',
    brandColor: '#E21F26'
  },
  'Airtel': { 
    name: 'Airtel',
    logo: 'https://ais-pre-fnfsghjjan77r3umaolc6z-49638028205.asia-east1.run.app/api/files/67c2cd8a-0284-469b-9806-64673898687a',
    color: 'text-[#E21F26]',
    bg: 'bg-[#E21F26]',
    brandColor: '#E21F26'
  },
  'Banglalink': { 
    name: 'Banglalink',
    logo: 'https://ais-pre-fnfsghjjan77r3umaolc6z-49638028205.asia-east1.run.app/api/files/67c2ed6a-213c-497d-9806-64673898687a',
    color: 'text-[#F37021]',
    bg: 'bg-[#F37021]',
    brandColor: '#F37021'
  },
  'Teletalk': { 
    name: 'Teletalk',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Teletalk_logo.svg/256px-Teletalk_logo.svg.png',
    color: 'text-[#4CAF50]',
    bg: 'bg-[#4CAF50]',
    brandColor: '#4CAF50'
  },
  ['Robi/Airtel' as any]: { 
    name: 'Robi/Airtel',
    logo: 'https://ais-pre-fnfsghjjan77r3umaolc6z-49638028205.asia-east1.run.app/api/files/67c2db1b-213c-497d-9806-64673898687a',
    color: 'text-[#E21F26]',
    bg: 'bg-[#E21F26]',
    brandColor: '#E21F26'
  }
};
