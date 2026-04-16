import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Recommendation } from '../types';

interface RecommendationsGridProps {
  recommendations: Recommendation[];
}

export function RecommendationsGrid({ recommendations }: RecommendationsGridProps) {
  return (
    <AnimatePresence>
      {recommendations.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {recommendations.slice(1, 5).map((rec, i) => (
            <div key={i} className="bento-card !p-4">
              <h4 className="font-bold text-sm truncate">{rec.title}</h4>
              <p className="text-[10px] text-text-dim mb-2">{rec.artist}</p>
              <p className="text-[10px] text-text-dim italic line-clamp-2">"{rec.reason}"</p>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
