import { apiClient } from './client';
import { attachDishImage } from '../content/menuPreview';
import type { Category, Dish } from '../types/menu';

type CategoryApiItem = {
  id: number;
  name: string;
};

type DishApiItem = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  category: number;
  category_name: string;
  is_active: boolean;
  is_available: boolean;
};

export async function fetchCategories() {
  const response = await apiClient.get<CategoryApiItem[]>('categories/');

  return response.data.map((category) => ({
    id: category.id,
    name: category.name,
  })) satisfies Category[];
}

export async function fetchDishes() {
  const response = await apiClient.get<DishApiItem[]>('dishes/');

  return response.data.map((dish) =>
    attachDishImage({
      id: dish.id,
      name: dish.name,
      description: dish.description,
      price: Number(dish.price),
      category: dish.category,
      categoryName: dish.category_name,
      isActive: dish.is_active,
      isAvailable: dish.is_available,
    }),
  ) satisfies Dish[];
}
