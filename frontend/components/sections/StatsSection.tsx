'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function StatsSection() {
  const t = useTranslations('home.stats');

  const stats = [
    { value: t('founded'), icon: '🏛️' },
    { value: t('tripadvisor'), icon: '⭐' },
    { value: t('instagram'), icon: '📸' },
    { value: t('tables'), icon: '🍽️' },
  ];

  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-accent font-bold text-xl">{stat.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
