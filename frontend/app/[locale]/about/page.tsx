'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Clock, ExternalLink, Utensils, Award, Heart, Music } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  const values = [
    { Icon: Utensils, title: t('values.authenticity'), desc: t('values.authenticityDesc') },
    { Icon: Award,    title: t('values.quality'),       desc: t('values.qualityDesc')       },
    { Icon: Heart,    title: t('values.hospitality'),   desc: t('values.hospitalityDesc')   },
    { Icon: Music,    title: t('values.culture'),       desc: t('values.cultureDesc')       },
  ];

  const team = [
    { name: 'Areg Manukyan',     role: 'Founder & Head Chef'  },
    { name: 'Ani Petrosyan',     role: 'Restaurant Manager'   },
    { name: 'Davit Sargsyan',    role: 'Sous Chef'            },
    { name: 'Nare Hovhannisyan', role: 'Sommelier'            },
  ];

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
          style={{ color: '#F5ECD7' }}
        >
          {t('title')}
        </motion.h1>
        <hr className="section-divider" />
        <p className="text-text-muted-green text-base">{t('subtitle')}</p>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-primary text-center mb-8">{t('story.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-text-secondary leading-relaxed"
            >
              {t('story.text1')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-text-secondary leading-relaxed"
            >
              {t('story.text2')}
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-primary text-center mb-8">{t('founder.title')}</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8 border border-border"
          >
            <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Utensils size={40} className="text-primary/40" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-primary">{t('founder.name')}</h3>
              <p className="text-accent font-medium mb-3">{t('founder.role')}</p>
              <p className="text-text-secondary leading-relaxed mb-3">{t('founder.bio')}</p>
              <a
                href="https://instagram.com/restormania"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-accent hover:underline"
              >
                <ExternalLink size={16} />
                <span>{t('founder.instagram')}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-accent text-center mb-3">{t('values.title')}</h2>
          <hr className="section-divider" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {values.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-primary-deeper rounded-lg p-6 text-center border border-green-border"
              >
                <Icon size={28} className="text-accent mx-auto mb-3" />
                <h3 className="text-accent font-bold mb-2">{title}</h3>
                <p className="text-text-muted-green text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-primary text-center mb-2">{t('team.title')}</h2>
          <p className="text-text-secondary text-center mb-8">{t('team.subtitle')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Utensils size={28} className="text-primary/40" />
                </div>
                <h3 className="font-bold text-primary">{member.name}</h3>
                <p className="text-text-secondary text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-bg">
        <div className="max-w-md mx-auto px-4 text-center space-y-3 text-text-secondary">
          <div className="flex items-center justify-center space-x-3">
            <MapPin className="text-accent" size={20} />
            <span>{t('address')}</span>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Phone className="text-accent" size={20} />
            <a href={`tel:${t('phone')}`} className="hover:text-accent transition-colors">{t('phone')}</a>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Clock className="text-accent" size={20} />
            <span>{t('hours')}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
