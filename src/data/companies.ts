export interface Agribusiness {
  id: string;
  name: string;
  category: 'Tanzanian' | 'Global';
  description: string;
  location: string;
  website: string;
  image: string;
  specialization: string;
}

export const AGRIBUSINESSES: Agribusiness[] = [
  {
    id: 'bayer-crop',
    name: 'Bayer Crop Science (Bayer AG)',
    category: 'Global',
    specialization: 'DeKalb hybrid seeds, crop protection chemicals & digital agricultural mapping',
    location: 'Leverkusen, Germany (East African division: Dar es Salaam, Tanzania)',
    website: 'https://www.bayer.com/',
    image: 'https://images.unsplash.com/photo-1628352654687-896f9102043c?auto=format&fit=crop&q=80&w=600',
    description: 'A world-leading life science company offering cutting edge crop-protection fungicides, highly scientific herbicides, and premier DeKalb hybrid maize seeds optimized for diverse East African microclimates.'
  },
  {
    id: 'yara-tz',
    name: 'Yara International (Yara East Africa)',
    category: 'Global',
    specialization: 'Premium mineral crop nutrients, YaraMila & YaraVera specialty fertilizers',
    location: 'Oslo, Norway (Tanzanian direct terminal: Dar es Salaam Port)',
    website: 'https://www.yara.co.tz/',
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=600',
    description: 'Yara is a Norwegian global leader in agricultural fertilizers, maintaining major logistical hubs and regional blending facilities in Tanzania to provide crop-specific nutrients and educational pilot test fields.'
  },
  {
    id: 'syngenta-tz',
    name: 'Syngenta Crop Protection',
    category: 'Global',
    specialization: 'Scientific seed care, premium selective herbicides & vegetable seeds',
    location: 'Basel, Switzerland (TZ Office: Arusha / Dar es Salaam)',
    website: 'https://www.syngenta.co.tz/',
    image: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=600',
    description: 'A premium global organization focused on crop longevity and defense. Syngenta delivers advanced crop protection treatments, smart greenhouse vegetable seeds, and educational safe-use programs to farms around Tanzania.'
  },
  {
    id: 'seedco-tz',
    name: 'Seed Co Tanzania',
    category: 'Tanzanian',
    specialization: 'Climate-smart hybrid seed varieties (Maize, Wheat, Soy)',
    location: 'Njiro Road, Arusha, Tanzania',
    website: 'https://www.seedco.co.tz/',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    description: 'One of the leading seed companies in Tanzania, famous for developing, producing, and marketing early-maturing and drought-tolerant seed varieties like the popular "Chapa Tumbili" maize hybrid.'
  },
  {
    id: 'tari-tz',
    name: 'Tanzania Agricultural Research Institute (TARI)',
    category: 'Tanzanian',
    specialization: 'State-backed crop research, soil diagnostics & certified seeds',
    location: 'Makutupora, Dodoma, Tanzania',
    website: 'https://www.tari.go.tz/',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600',
    description: 'The national public institute responsible for coordinating and conducting agricultural research in Tanzania. TARI works directly with smallholder farmers to introduce disease-resistant varieties for crops like cassava, maize, and rice.'
  },
  {
    id: 'minjingu-fertilizer',
    name: 'Minjingu Mines & Fertilizer Ltd',
    category: 'Tanzanian',
    specialization: 'Organic rock phosphate powders & blended nitrogen fertilizers',
    location: 'Manyara Region, Tanzania (HQ in Arusha)',
    website: 'http://minjingu.com/',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600',
    description: 'Tanzania\'s premier domestic manufacturer of organic phosphate and special blended fertilizers, utilizing rich local bio-mineral deposits near Lake Manyara to supply highly sustainable crop nutrients.'
  },
  {
    id: 'etg-tanzania',
    name: 'Export Trading Group (ETG) Tanzania',
    category: 'Tanzanian',
    specialization: 'Crop inputs distribution, warehouse logistics & global commodity trade',
    location: 'Dar es Salaam, Tanzania',
    website: 'https://www.etgworld.com/',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    description: 'A global agricultural supply-chain titan founded and deeply integrated within East Africa. ETG coordinates logistics, distributes fertilizers and agrochemicals, and procures cash crops directly from thousands of Tanzanian smallholder farmers.'
  }
];
