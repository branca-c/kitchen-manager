import type { Category, Dish } from '../types/menu';

const DISH_IMAGE_BY_NAME: Record<string, string> = {
  Margherita: '/images/dishes/margherita.svg',
  Diavola: '/images/dishes/diavola.svg',
  'Bacon Burger': '/images/dishes/bacon-burger.svg',
  'Pizza Storica 2025': '/images/dishes/pizza-storica.svg',
  'Coca Cola 33cl': '/images/dishes/coca-cola.svg',
};

const FALLBACK_IMAGE_BY_CATEGORY: Record<string, string> = {
  Pizze: '/images/dishes/margherita.svg',
  Burger: '/images/dishes/bacon-burger.svg',
  Bevande: '/images/dishes/coca-cola.svg',
};

export const previewCategories: Category[] = [
  { id: 1, name: 'Pizze' },
  { id: 2, name: 'Burger' },
  { id: 3, name: 'Bevande' },
];

export function getDishImageUrl(name: string, categoryName: string) {
  return DISH_IMAGE_BY_NAME[name] ?? FALLBACK_IMAGE_BY_CATEGORY[categoryName] ?? '/images/dishes/margherita.svg';
}

export function attachDishImage(dish: Omit<Dish, 'imageUrl'> & Partial<Pick<Dish, 'imageUrl'>>): Dish {
  return {
    ...dish,
    imageUrl: dish.imageUrl ?? getDishImageUrl(dish.name, dish.categoryName),
  };
}

export const previewDishes: Dish[] = [
  attachDishImage({
    id: 1,
    name: 'Margherita',
    description: 'Pomodoro, mozzarella, basilico fresco',
    price: 8.5,
    category: 1,
    categoryName: 'Pizze',
    isActive: true,
    isAvailable: true,
  }),
  attachDishImage({
    id: 2,
    name: 'Diavola',
    description: 'Pomodoro, mozzarella, salame piccante',
    price: 10,
    category: 1,
    categoryName: 'Pizze',
    isActive: true,
    isAvailable: true,
  }),
  attachDishImage({
    id: 3,
    name: 'Bacon Burger',
    description: 'Manzo 200g, cheddar, bacon croccante',
    price: 12,
    category: 2,
    categoryName: 'Burger',
    isActive: true,
    isAvailable: false,
  }),
  attachDishImage({
    id: 4,
    name: 'Pizza Storica 2025',
    description: 'Edizione limitata dello scorso anno',
    price: 15,
    category: 1,
    categoryName: 'Pizze',
    isActive: false,
    isAvailable: false,
  }),
  attachDishImage({
    id: 5,
    name: 'Coca Cola 33cl',
    description: 'Lattina',
    price: 2.5,
    category: 3,
    categoryName: 'Bevande',
    isActive: true,
    isAvailable: true,
  }),
];

export const visiblePreviewDishes = previewDishes.filter((dish) => dish.isActive);
