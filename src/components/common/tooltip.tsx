'use client';

import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delayMs?: number;
}

/**
 * ツールチップコンポーネント
 * 初心者向けガイダンス表示
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  delayMs = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delayMs);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const arrowClasses = {
    top: 'top-full border-t-gray-700',
    bottom: 'bottom-full border-b-gray-700',
    left: 'left-full border-l-gray-700',
    right: 'right-full border-r-gray-700',
  };

  return (
    <div className="relative inline-block group">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`
            absolute ${positionClasses[position]}
            bg-gray-700 text-white text-sm rounded px-3 py-2
            whitespace-nowrap pointer-events-none z-50
            animation-fade-in
          `}
          role="tooltip"
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-4
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
}

interface OnboardingGuideProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  onNext?: () => void;
  onSkip?: () => void;
}

/**
 * オンボーディングガイドコンポーネント
 * 初回ユーザーの導線ガイダンス
 */
export function OnboardingGuide({
  step,
  totalSteps,
  title,
  description,
  onNext,
  onSkip,
}: OnboardingGuideProps) {
  return (
    <div className="fixed bottom-6 right-6 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-6 max-w-sm z-40">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-blue-900">{title}</h3>
        <button
          onClick={onSkip}
          className="text-blue-600 hover:text-blue-900 text-sm"
        >
          スキップ
        </button>
      </div>

      <p className="text-gray-700 mb-4">{description}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < step ? 'bg-blue-600' : 'bg-blue-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
