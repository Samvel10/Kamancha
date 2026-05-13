'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function StatsSection() {
  const t = useTranslations('home.stats');

  const stats = [
    { value: '#3',     label: 'TripAdvisor Yerevan' },
    { value: '75K',    label: 'Instagram Followers' },
    { value: '120+',   label: 'Seats Available'      },
    { value: '2019',   label: 'Serving Yerevan'      },
  ];
  void t;

  return (
    <section className="bg-primary-deeper py-10 border-t border-b border-green-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-green-border">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center px-4"
            >
              <div
                className="font-display font-bold text-accent"
                style={{ fontSize: '22px' }}
              >
                {value}
              </div>
              <div
                className="text-text-muted-green-2 uppercase mt-1"
                style={{ fontSize: '11px', letterSpacing: '1.5px' }}
              >
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
