/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TermsSection {
  id: string;
  titleEn: string;
  titleSw: string;
  badge?: string;
  items: {
    headingEn: string;
    headingSw: string;
    contentEn: string;
    contentSw: string;
    prohibited?: boolean;
    reserved?: boolean;
  }[];
}

export interface LegalCharter {
  version: string;
  lastUpdated: string;
  copyrightYear: string;
  owner: string;
  summaryEn: string;
  summarySw: string;
  sections: TermsSection[];
}

export const DEFAULT_PROHIBITED_TERMS: string[] = [
  'narcotics',
  'toxic chemical synthesis',
  'automated bot scraping',
  'ddt pesticide manufacture',
  'bulk crawler exploit',
  'commercial data reselling',
  'climate sensor spoofing',
  'system exploit'
];

export const LEGAL_CHARTER: LegalCharter = {
  version: 'v2.4.1 (2026 Edition)',
  lastUpdated: 'October 2026',
  copyrightYear: '2026',
  owner: 'Abel Crop Intelligence & Abel Samwel',
  summaryEn: 'Official declaration of reserved intellectual property, permitted agricultural fair-use, and prohibited terms and conduct for Abel Crop Intelligence.',
  summarySw: 'Tamko rasmi la haki miliki zilizohifadhiwa, matumizi ya kilimo yanayoruhusiwa, na vigezo pamoja na vitendo vilivyopigwa marufuku katika mfumo wa Abel Crop Intelligence.',
  sections: [
    {
      id: 'reserved',
      titleEn: '1. Reserved Rights & Intellectual Property',
      titleSw: '1. Haki Zilizohifadhiwa na Umiliki wa Kitaaluma',
      badge: 'Protected',
      items: [
        {
          headingEn: '1.1 Proprietary Algorithmic Intelligence',
          headingSw: '1.1 Mifumo ya Kihesabu na Algoriti za Kidijitali',
          contentEn: 'All algorithmic microclimate evaluations, crop requirement scoring models, Frogcast meteorological synthesis routines, and Abel AI prompt engineering models are the proprietary intellectual property of Abel Crop Intelligence (Abel Samwel). All rights are strictly reserved worldwide.',
          contentSw: 'Tathmini zote za kihesabu za hali ya hewa, miundo ya viwango vya mahitaji ya mimea, mifumo ya Frogcast na muundo wa maelekezo ya Abel AI ni mali ya kibinafsi na ya kitaaluma ya Abel Crop Intelligence (Abel Samwel). Haki zote zimehifadhiwa duniani kote.',
          reserved: true
        },
        {
          headingEn: '1.2 Curated Agronomic Database Rights',
          headingSw: '1.2 Haki Miliki ya Hifadhidata ya Kilimo',
          contentEn: 'The compiled databases covering cereals, fruits, vegetables, East African coffee and crop sub-variants, optimal soil pH thresholds, and fungal/bacterial disease vectors represent proprietary compiled works protected under international copyright law.',
          contentSw: 'Hifadhidata iliyoratibiwa ikijumuisha nafaka, matunda, mboga, aina za kahawa za Afrika Mashariki, viwango vya pH ya udongo, na magonjwa ya mazao ni kazi iliyokusanywa na kulindwa chini ya sheria za kimataifa za hakimiliki.',
          reserved: true
        },
        {
          headingEn: '1.3 Trademark & Identity Reservation',
          headingSw: '1.3 Alama za Biashara na Utambulisho wa Mfumo',
          contentEn: 'The names "Abel Crop Intelligence", "Abel AI Advisor", "Frogcast Atmospherics", the application icons, brand trade dress, and interface assets remain the sole exclusive property of Abel Samwel. No unauthorized use or confusingly similar naming is permitted.',
          contentSw: 'Majina "Abel Crop Intelligence", "Abel AI Advisor", "Frogcast Atmospherics", nembo za mfumo, na mwonekano wa kiolesura ni mali ya pekee ya Abel Samwel. Matumizi yasiyoruhusiwa au majina yanayofanana hayaruhusiwi kabisa.',
          reserved: true
        },
        {
          headingEn: '1.4 Reservation of Program Revisions & Advisory Governance',
          headingSw: '1.4 Haki ya Marekebisho na Usimamizi wa Ushauri',
          contentEn: 'The program administrators reserve the unilateral right to update climate models, calibrate agricultural advice, refine disease guidance, and update security parameters to safeguard farmers and scientific precision.',
          contentSw: 'Wasimamizi wa mfumo wanahifadhi haki ya kuboresha mifumo ya hali ya hewa, kurekebisha miongozo ya kilimo, na kusasisha vigezo vya usalama ili kumlinda mkulima na kuweka viwango vya juu vya kisayansi.',
          reserved: true
        }
      ]
    },
    {
      id: 'prohibited',
      titleEn: '2. Prohibited Terms, Disallowed Conduct & Safeguards',
      titleSw: '2. Vigezo Vilivyokatazwa, Matumizi Yasiyoruhusiwa na Kinga',
      badge: 'Strictly Enforced',
      items: [
        {
          headingEn: '2.1 Automated Data Scraping & Bot Crawling Prohibited',
          headingSw: '2.1 Ukusanyaji Data Bila Idhini (Scraping & Bots) Umepigwa Marufuku',
          contentEn: 'Systematic crawling, automated bot scraping, headless extraction, or bulk harvesting of crop variants, pest treatments, or Frogcast meteorological data without explicit written consent is strictly prohibited.',
          contentSw: 'Kutumia roboti za kidijitali, programu za kunakili data kiotomatiki (scraping), au kuvuna data kwa wingi bila idhini ya maandishi ni marufuku kabisa.',
          prohibited: true
        },
        {
          headingEn: '2.2 Prohibited Queries & Hazardous Agro-Chemical Formulation',
          headingSw: '2.2 Maswali na Maombi Yaliyopigwa Marufuku (Sumu na Madawa Haramu)',
          contentEn: 'Submitting queries into Abel AI to synthesize banned persistent organic pollutants (e.g. DDT, Aldrin), illegal synthetic toxins, biological hazards, or unlawful narcotic plant cultivation is strictly prohibited and actively intercepted by security shields.',
          contentSw: 'Kutuma maombi au maswali kwa Abel AI kuhusu utengenezaji wa sumu zilizopigwa marufuku (kama vile DDT), kemikali haramu, vichochezi hatari, au kilimo cha mimea ya kulevya ni marufuku na huzuiliwa kiotomatiki.',
          prohibited: true
        },
        {
          headingEn: '2.3 Commercial Resale & Sublicensing Prohibited',
          headingSw: '2.3 Kuuza Upya au Kutoa Leseni za Kibiashara Bila Idhini',
          contentEn: 'Reselling, sublicensing, white-labeling, or charging third parties for subscription access to this program or its underlying database is prohibited without a formalized commercial tier agreement.',
          contentSw: 'Kuuza upya mfumo huu, kutoa leseni za kibiashara, au kutoza ada wakulima wengine kwa kutumia mfumo huu bila makubaliano rasmi ya kibiashara ni marufuku.',
          prohibited: true
        },
        {
          headingEn: '2.4 Reverse Engineering & Algorithmic Tampering Prohibited',
          headingSw: '2.4 Kubomoa Kanuni au Kuingilia Mifumo ya Usalama',
          contentEn: 'Decompiling, disassembling, reverse engineering, or injecting hostile prompt attacks to bypass safety filters or extract proprietary model keys is strictly prohibited.',
          contentSw: 'Kujaribu kubomoa mfumo, kuingilia kanuni za kihesabu, au kutuma maelekezo hasidi ili kuvunja mifumo ya usalama ni marufuku vikali.',
          prohibited: true
        },
        {
          headingEn: '2.5 Spreading Agricultural Misinformation Prohibited',
          headingSw: '2.5 Kusambaza Taarifa Potofu za Kilimo Kwenye Mfumo',
          contentEn: 'Attempting to inject false weather signals, corrupt soil pH telemetry, or misrepresent registered agribusiness inputs with intent to deceive farmers is strictly prohibited.',
          contentSw: 'Kujaribu kuingiza taarifa za uongo za hali ya hewa, kupotosha viwango vya udongo, au kusambaza taarifa za kupotosha wakulima ni marufuku kabisa.',
          prohibited: true
        }
      ]
    },
    {
      id: 'fairuse',
      titleEn: '3. Permitted Agricultural Fair-Use for Farmers',
      titleSw: '3. Matumizi Yanayoruhusiwa ya Kilimo kwa Wakulima',
      badge: 'Community Friendly',
      items: [
        {
          headingEn: '3.1 Smallholder Farming & Extension Officer Exemption',
          headingSw: '3.1 Ruhusa Maalum kwa Wakulima Wadogo na Maafisa Ugani',
          contentEn: 'Smallholder farmers, field extension officers, and agricultural students are granted a free, perpetual, non-exclusive license to view, apply, and consult all recommendations for direct food production and community improvement.',
          contentSw: 'Wakulima wadogo, maafisa ugani wa kilimo, na wanafunzi wa fani ya kilimo wanapewa ruhusa ya kudumu na bila malipo kutumia, kutekeleza, na kufuata miongozo hii shambani kuboresha uzalishaji wa chakula.',
          reserved: false
        },
        {
          headingEn: '3.2 Academic & Educational Research Attribution',
          headingSw: '3.2 Matumizi ya Kielimu na Utafiti wa Vyuo',
          contentEn: 'Agronomy researchers, educators, and schools are encouraged to study our crop databases and citing: "Data & Microclimatic Models courtesy of Abel Crop Intelligence (2026)".',
          contentSw: 'Watafiti na walimu wanaruhusiwa kusoma na kutumia data hizi kwa kutoa shukrani: "Takwimu na Miundo ya Kilimo kutoka Abel Crop Intelligence (2026)".',
          reserved: false
        }
      ]
    }
  ]
};
