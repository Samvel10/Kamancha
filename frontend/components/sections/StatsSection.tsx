'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Award, Users, MapPin, Calendar } from 'lucide-react';

export default function StatsSection() {
  const t = useTranslations('home.stats');

  const stats = [
    { value: t('tripadvisor'), label: 'Yerevan Ranking',   Icon: Award    },
    { value: t('instagram'),   label: 'Social Followers',  Icon: Users    },
    { value: t('tables'),      label: 'Dining Capacity',   Icon: MapPin   },
    { value: t('founded'),     label: 'Serving Yerevan',   Icon: Calendar },
  ];

  return (
    <section className="py-12 bg-primary-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center py-4"
            >
              <Icon size={22} className="text-accent mx-auto mb-2" />
              <div className="text-accent font-bold text-xl font-display">{value}</div>
              <div className="text-white/50 text-xs uppercase tracking-wider mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
