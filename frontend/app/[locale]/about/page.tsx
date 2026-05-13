'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');
  const values = [
    { icon: '🍽️', title: t('values.authenticity'), desc: t('values.authenticityDesc') },
    { icon: '⭐', title: t('values.quality'), desc: t('values.qualityDesc') },
    { icon: '🤝', title: t('values.hospitality'), desc: t('values.hospitalityDesc') },
    { icon: '🎻', title: t('values.culture'), desc: t('values.cultureDesc') },
  ];
  const team = [
    { name: 'Areg Manukyan', role: 'Founder & Head Chef', emoji: '👨‍🍳' },
    { name: 'Ani Petrosyan', role: 'Restaurant Manager', emoji: '👩‍💼' },
    { name: 'Davit Sargsyan', role: 'Sous Chef', emoji: '👨‍🍳' },
    { name: 'Nare Hovhannisyan', role: 'Sommelier', emoji: '🍷' },
  ];

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-20 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold text-bg mb-3">{t('title')}</motion.h1>
        <p className="text-accent text-lg">{t('subtitle')}</p>
      </div>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">{t('story.title')}</h2>
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-text-main/80 leading-relaxed">{t('story.text1')}</motion.p>
            <motion.p initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-text-main/80 leading-relaxed">{t('story.text2')}</motion.p>
          </div>
        </div>
      </section>
      <section className="py-16 bg-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">{t('founder.title')}</h2>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-6xl shrink-0">👨‍🍳</div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{t('founder.name')}</h3>
              <p className="text-accent font-medium mb-3">{t('founder.role')}</p>
              <p className="text-text-main/70 leading-relaxed mb-3">{t('founder.bio')}</p>
              <a href="https://instagram.com/restormania" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-accent hover:underline"><ExternalLink size={16}/><span>{t('founder.instagram')}</span></a>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-bg text-center mb-10">{t('values.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/10 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="text-accent font-bold mb-2">{v.title}</h3>
                <p className="text-bg/70 text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">{t('team.title')}</h2>
          <p className="section-subtitle text-center">{t('team.subtitle')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-20 h-20 mx-auto bg-bg rounded-full flex items-center justify-center text-4xl mb-3">{member.emoji}</div>
                <h3 className="font-bold text-primary">{member.name}</h3>
                <p className="text-text-main/60 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 bg-bg">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="space-y-3 text-text-main/70">
            <div className="flex items-center justify-center space-x-3"><MapPin className="text-accent" size={20}/><span>{t('address')}</span></div>
            <div className="flex items-center justify-center space-x-3"><Phone className="text-accent" size={20}/><a href={`tel:${t('phone')}`} className="hover:text-accent">{t('phone')}</a></div>
            <div className="flex items-center justify-center space-x-3"><Clock className="text-accent" size={20}/><span>{t('hours')}</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
