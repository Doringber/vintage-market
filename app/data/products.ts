export type Product = {
  slug: string;
  name: string;
  category: string;
  price: string;
  image: string;
  images?: string[];
  description: string;
};

export const products: Product[] = [
  {
    slug: "vroomzoom-driving-board-front",
    name: "לוח נהיגה אינטראקטיבי - חזית",
    category: "צעצועים לבנים",
    price: "₪249",
    image:
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85",
    description:
      "לוח עץ איכותי עם הגה, כפתורים ומסך משחק - לפיתוח דמיון, קשב וקואורדינציה.",
  },
  {
    slug: "vroomzoom-driving-board-side",
    name: "לוח נהיגה אינטראקטיבי - מבט צד",
    category: "צעצועים לבנים",
    price: "₪249",
    image:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=85",
    description:
      "אותו דגם אהוב מזווית צד המדגישה את מבנה העץ והחלקים האינטראקטיביים.",
  },
  {
    slug: "vroomzoom-driving-board-back",
    name: "לוח נהיגה אינטראקטיבי - גב המוצר",
    category: "צעצועים לבנים",
    price: "₪249",
    image:
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=900&q=85",
    description:
      "תצוגת גב המוצר עם פרטי יצרן ואריזה - מעולה להורים שרוצים לראות הכל לפני קנייה.",
  },
  {
    slug: "war-machine-figure",
    name: "בובת וור משין - דמות גיבור",
    category: "צעצועים לבנים",
    price: "₪119",
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=85",
    description:
      "דמות אקשן קשיחה ומפורטת בהשראת גיבורי-על. מתאימה למשחק ולתצוגה.",
  },
  {
    slug: "superman-figure",
    name: "בובת סופרמן קלאסית",
    category: "צעצועים לבנים",
    price: "₪99",
    image:
      "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=900&q=85",
    description:
      "דמות סופרמן עם גלימה אדומה בסגנון קלאסי - מתנה מושלמת לחובבי קומיקס.",
  },
];
