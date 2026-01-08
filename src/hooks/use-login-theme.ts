import { useState, useEffect } from "react";

export interface LoginTheme {
  image: string;
  quote: string;
  author: string;
}

const LOGIN_THEMES: LoginTheme[] = [
  {
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070",
    quote: "The distance between your dreams and reality is called action.",
    author: "Start your journey today."
  },
  {
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070",
    quote: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    author: "Your visa is waiting."
  },
  {
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070",
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Build your future."
  },
  {
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074",
    quote: "Man cannot discover new oceans unless he has the courage to lose sight of the shore.",
    author: "Fly to your dreams."
  },
  {
    image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?q=80&w=2073",
    quote: "The expert in anything was once a beginner.",
    author: "Take the first step."
  }
];

export const useLoginTheme = () => {
  const [theme, setTheme] = useState<LoginTheme | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LOGIN_THEMES.length);
    const selectedTheme = LOGIN_THEMES[randomIndex];
    setTheme(selectedTheme);
  }, []);

  return { theme };
};
