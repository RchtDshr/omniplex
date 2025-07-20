import { Metadata } from 'next';
import Pricing from '@/components/Pricing/Pricing';

export const metadata: Metadata = {
  title: 'Pricing - Omniplex',
  description: 'Choose the perfect plan for your needs. Start free and upgrade as you grow.',
};

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <Pricing />
    </div>
  );
}
