import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState('evening');

  // Update time of day based on user's local time
  useEffect(() => {
    const updateTimeOfDay = () => {
      // Get current time in user's local timezone
      const now = new Date();
      const currentHour = now.getHours(); // This automatically uses local timezone
      const newTimeOfDay = currentHour >= 6 && currentHour < 18 ? 'morning' : 'evening';

      console.log(`Local time: ${now.toLocaleString()}, Hour: ${currentHour}, Time of day: ${newTimeOfDay}`);
      setTimeOfDay(newTimeOfDay);
    };

    // Update immediately
    updateTimeOfDay();

    // Update every minute to catch time changes
    const interval = setInterval(updateTimeOfDay, 60000);

    return () => clearInterval(interval);
  }, []);

  // Define color schemes
  const themes = {
    morning: {
      // Primary colors (replaces amber)
      primary: 'blue-400',
      primaryHover: 'blue-500',
      primaryLight: 'blue-300',
      primaryDark: 'blue-600',

      // Accent colors (replaces orange)
      accent: 'sky-400',
      accentHover: 'sky-500',
      accentLight: 'sky-300',

      // Background glows and effects
      glow: 'blue-500',
      glowSecondary: 'cyan-500',

      // Tailwind class strings for gradients
      gradient: 'from-blue-400 to-sky-500',
      gradientReverse: 'from-sky-500 to-blue-400',

      // Badge and highlight
      badge: 'blue-500',
      highlight: 'blue-400',

      // Text colors
      text: 'blue-400',
      textHover: 'blue-300',

      // Border colors with opacity
      border: 'blue-400/20',
      borderHover: 'blue-400/30',
      borderFocus: 'blue-400/50',

      // Background colors with opacity
      bg: 'blue-400/20',
      bgHover: 'blue-500/30',
      bgLight: 'blue-500/5',
      bgMedium: 'blue-500/10',

      // Button colors
      button: 'blue-400',
      buttonHover: 'blue-500',
      buttonText: 'zinc-900',

      // Shadow colors
      shadow: 'blue-500/30',
      shadowLight: 'blue-500/10',
    },
    evening: {
      // Primary colors (amber)
      primary: 'amber-400',
      primaryHover: 'amber-500',
      primaryLight: 'amber-300',
      primaryDark: 'amber-600',

      // Accent colors (orange)
      accent: 'orange-400',
      accentHover: 'orange-500',
      accentLight: 'orange-300',

      // Background glows and effects
      glow: 'amber-500',
      glowSecondary: 'orange-500',

      // Tailwind class strings for gradients
      gradient: 'from-amber-400 to-orange-500',
      gradientReverse: 'from-orange-500 to-amber-400',

      // Badge and highlight
      badge: 'amber-500',
      highlight: 'amber-400',

      // Text colors
      text: 'amber-400',
      textHover: 'amber-300',

      // Border colors with opacity
      border: 'amber-400/20',
      borderHover: 'amber-400/30',
      borderFocus: 'amber-400/50',

      // Background colors with opacity
      bg: 'amber-400/20',
      bgHover: 'amber-500/30',
      bgLight: 'amber-500/5',
      bgMedium: 'amber-500/10',

      // Button colors
      button: 'amber-400',
      buttonHover: 'amber-500',
      buttonText: 'zinc-900',

      // Shadow colors
      shadow: 'amber-500/30',
      shadowLight: 'amber-500/10',
    }
  };

  const theme = themes[timeOfDay];

  const value = {
    timeOfDay,
    theme,
    colors: theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
